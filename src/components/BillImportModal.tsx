import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../AppContext';
import { t } from '../i18n';

type DraftExpense = {
  target: ImportTarget;
  date: string;
  description: string;
  amount: number;
  category: string;
  merchant: string;
  confidence: number;
  rawText: string;
};

type BillImportModalProps = {
  open: boolean;
  onClose: () => void;
};

type ImportTarget = 'expense' | 'bill' | 'income' | 'debt' | 'savings';
const importTargets: ImportTarget[] = ['expense', 'bill', 'income', 'debt', 'savings'];

type LineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type DocumentType = 'receipt' | 'bank_transfer' | 'utility_bill';

const amountPattern = /\d{1,3}(?:[.,\s]\d{3})+(?:[.,]\d{1,2})?|\d{4,}/g;
const totalKeywords = [
  'total',
  'grand total',
  'amount due',
  'balance due',
  'payment',
  'tong cong',
  'tong',
  'tong tien',
  'thanh tien',
  't cong',
  't.cong',
  'khach tra',
  'can thanh toan',
  'phai tra',
  'tien mat',
  'vnd',
];
const finalTotalKeywords = ['t cong', 't.cong', 'tong cong', 'tong', 'grand total', 'amount due', 'balance due', 'khach tra', 'phai tra', 'vnd'];
const subtotalKeywords = ['thanh tien', 'subtotal'];
const amountIgnoredKeywords = ['ngay', 'so h', 'so h.d', 'so hd', 'lien', 'receipt no', 'invoice no', 'phone', 'dt:', 'dien thoai', 'giam', 'discount', 'so du', 'balance'];
const bankTransferKeywords = [
  'chi tiet giao dich',
  'ngay giao dich',
  'noi dung giao dich',
  'so tien giao dich',
  'so tham chieu',
  'chuyen khoan',
  'giao dich thanh cong',
  'chuyen tien',
  'nguoi nhan',
  'nguoi chuyen',
  'tai khoan nguon',
  'tai khoan nhan',
  'ma giao dich',
  'transaction',
  'transfer',
  'beneficiary',
  'recipient',
];
const bankAmountKeywords = ['so tien giao dich', 'so tien', 'amount', 'transfer amount', 'chuyen khoan', 'chuyen tien', 'da chuyen', 'vnd'];
const bankPrimaryAmountKeywords = ['so tien giao dich', 'transaction amount', 'transfer amount'];
const bankIgnoredAmountKeywords = ['ma giao dich', 'ma gd', 'reference', 'ref', 'tai khoan', 'stk', 'account', 'ngay', 'date', 'time', 'phone', 'dt:', 'so du', 'balance', 'noi dung giao dich'];
const bankDescriptionKeywords = ['nguoi nhan', 'den', 'toi', 'recipient', 'beneficiary', 'noi dung', 'content', 'description'];
const incomeKeywords = ['salary', 'payroll', 'luong', 'tra luong', 'traluong', 'thu nhap', 'received', 'incoming', 'nhan tien', 'duoc chuyen', 'credit'];
const billKeywords = ['bill', 'invoice', 'hoa don', 'due date', 'han thanh toan', 'electric', 'water', 'internet', 'rent', 'subscription'];
const debtKeywords = ['loan', 'debt', 'installment', 'tra gop', 'vay', 'no ', 'credit card'];
const savingsKeywords = ['saving', 'savings', 'deposit', 'interest', 'tiet kiem', 'lai suat'];
const utilityBillKeywords = ['dien luc', 'nuoc', 'viettel', 'cuoc tra sau', 'nha cung cap', 'ky thanh toan', 'ma khach hang', 'ma thue bao', 'hoa don'];
const utilityProviderKeywords = ['dien luc', 'nuoc', 'viettel', 'cuoc tra sau'];
const utilityAmountKeywords = ['so tien ghi nhan', 'so tien', 'ghi nhan'];
const utilityIgnoredAmountKeywords = [
  'ma giao dich',
  'ma khach hang',
  'ma thue bao',
  'tong phi',
  'thuong xu',
  'so du',
  'balance',
  'ky thanh toan',
  'thoi gian',
  'ngay',
  'dia chi',
  'ten khach hang',
];
const merchantIgnoredKeywords = [
  'receipt',
  'invoice',
  'hoa don',
  'ban hang',
  'table',
  'ban ',
  'ngay',
  'so:',
  'thu ngan',
  'gio vao',
  'gio ra',
  'in luc',
  'dt:',
  'phone',
  'address',
  'dia chi',
  'duong',
  'tp.',
  'tax',
  'vat',
];
const itemHeaderKeywords = ['mat hang', 'item', 'description', 'sl', 'qty', 'gia', 'price', 'tien', 'amount'];

const categoryKeywords: Record<string, string[]> = {
  'Food': ['restaurant', 'coffee', 'cafe', 'ca phe', 'food', 'burger', 'pizza', 'milk tea', 'tra sua', 'com', 'pho', 'bun', 'quan an'],
  'Transportation': ['grab', 'taxi', 'bus', 'metro', 'parking', 'xang', 'fuel', 'gasoline', 'transport'],
  'Shopping': ['mart', 'store', 'shop', 'market', 'supermarket', 'mall', 'winmart', 'coop', 'lotte'],
  'Entertainment': ['cinema', 'movie', 'ticket', 'game', 'karaoke', 'netflix', 'spotify'],
  'Healthcare': ['pharmacy', 'clinic', 'hospital', 'medicine', 'drug', 'nha thuoc', 'benh vien'],
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();

const parseMoney = (value: string) => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return Number(digits);
};

const parseOcrMoney = (value: string) => {
  return parseMoney(value.replace(/[oO]/g, '0'));
};

const getBankAmountMatches = (line: string, primaryLine: boolean) => {
  if (!primaryLine) return line.match(amountPattern) ?? [];

  const correctedLine = line.replace(/[oO]/g, '0');
  const currencyMatch = correctedLine.match(/[+-]?\s*\d[\d.,\s]*\d(?=\s*(?:vnd|d|₫|đ))/i);
  if (currencyMatch) return [currencyMatch[0]];

  return correctedLine.match(/[+-]?\s*\d[\d.,\s]*\d/g) ?? [];
};

const loadImage = async (file: Blob) => {
  const imageUrl = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const preprocessImage = async (file: File) => {
  const image = await loadImage(file);
  try {
    const maxSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(3, Math.max(1.5, 2400 / maxSide));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);

    const context = canvas.getContext('2d');
    if (!context) return file;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let sum = 0;

    for (let index = 0; index < data.length; index += 4) {
      const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      sum += gray;
    }

    const average = sum / (data.length / 4);
    const threshold = Math.max(120, Math.min(190, average * 0.92));

    for (let index = 0; index < data.length; index += 4) {
      const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      const contrasted = (gray - 128) * 1.45 + 128;
      const value = contrasted > threshold ? 255 : 0;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
    }

    context.putImageData(imageData, 0, 0);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob ?? file), 'image/png');
    });
  } finally {
  }
};

const cropTopAmountArea = async (file: File) => {
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const sourceY = Math.round(image.naturalHeight * 0.08);
  const sourceHeight = Math.round(image.naturalHeight * 0.28);
  const scale = Math.min(3, Math.max(1.5, 2200 / image.naturalWidth));
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(sourceHeight * scale);

  const context = canvas.getContext('2d');
  if (!context) return file;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    0,
    sourceY,
    image.naturalWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/png');
  });
};

const getTodayKey = () => {
  const today = new Date();
  const offsetDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().split('T')[0];
};

const detectDocumentType = (rawText: string): DocumentType => {
  const normalized = normalizeText(rawText);
  const utilityMatches = utilityBillKeywords.filter((keyword) => normalized.includes(keyword)).length;
  if (utilityMatches >= 2) {
    return 'utility_bill';
  }
  if (normalized.includes('so tien giao dich') || normalized.includes('chi tiet giao dich')) {
    return 'bank_transfer';
  }
  const bankMatches = bankTransferKeywords.filter((keyword) => normalized.includes(keyword)).length;
  return bankMatches >= 2 ? 'bank_transfer' : 'receipt';
};

const hasAnyKeyword = (normalizedText: string, keywords: string[]) => {
  return keywords.some((keyword) => normalizedText.includes(keyword));
};

const classifyImportTarget = (rawText: string, documentType: DocumentType): ImportTarget => {
  const normalized = normalizeText(rawText);

  if (documentType === 'utility_bill') return 'bill';
  if (hasAnyKeyword(normalized, savingsKeywords)) return 'savings';
  if (hasAnyKeyword(normalized, debtKeywords)) return 'debt';
  if (hasAnyKeyword(normalized, incomeKeywords)) return 'income';
  if (documentType === 'bank_transfer' && /\+\s*\d/.test(rawText)) return 'income';
  if (hasAnyKeyword(normalized, billKeywords) && !hasAnyKeyword(normalized, ['ban hang', 'phieu tinh tien'])) return 'bill';
  if (documentType === 'bank_transfer') return 'expense';

  return 'expense';
};

const findMerchant = (lines: string[]) => {
  const candidate = lines
    .slice(0, 10)
    .map((line) => line.trim())
    .find((line) => {
      const normalized = normalizeText(line);
      const hasTooManyDigits = (line.match(/\d/g) ?? []).length > 3;
      return (
        line.length >= 3 &&
        !line.match(amountPattern) &&
        !hasTooManyDigits &&
        !merchantIgnoredKeywords.some((word) => normalized.includes(word))
      );
    });

  return candidate ?? '';
};

const shouldIgnoreAmountLine = (normalizedLine: string) => {
  return amountIgnoredKeywords.some((keyword) => normalizedLine.includes(keyword));
};

const getTotalPriority = (normalizedLine: string) => {
  if (finalTotalKeywords.some((keyword) => normalizedLine.includes(keyword))) return 3_000_000_000;
  if (subtotalKeywords.some((keyword) => normalizedLine.includes(keyword))) return 1_000_000_000;
  if (totalKeywords.some((keyword) => normalizedLine.includes(keyword))) return 2_000_000_000;
  return 0;
};

const findAmount = (lines: string[]) => {
  const scoredAmounts: Array<{ amount: number; score: number }> = [];

  lines.forEach((line, index) => {
    const normalized = normalizeText(line);
    const matches = line.match(amountPattern) ?? [];
    if (shouldIgnoreAmountLine(normalized)) return;
    matches.forEach((match) => {
      const amount = parseOcrMoney(match);
      if (amount <= 0) return;
      if (amount > 100_000_000) return;

      const hasCurrency = /vnd|vnđ|đ|d\b|₫/i.test(line);
      const hasTotalKeyword = totalKeywords.some((keyword) => normalized.includes(keyword));
      const score = amount + (hasTotalKeyword ? 2_000_000_000 : 0) + (hasCurrency ? 500_000_000 : 0) - index;
      scoredAmounts.push({ amount, score });
    });
    const totalPriority = getTotalPriority(normalized);
    if (totalPriority > 0 && matches.length > 0) {
      const lastAmount = parseMoney(matches[matches.length - 1]);
      if (lastAmount > 0 && lastAmount <= 100_000_000) {
        scoredAmounts.push({ amount: lastAmount, score: lastAmount + totalPriority - index });
      }
    }
  });

  if (scoredAmounts.length === 0) return 0;
  scoredAmounts.sort((a, b) => b.score - a.score);
  return scoredAmounts[0].amount;
};

const findLineItems = (lines: string[]): LineItem[] => {
  return lines.flatMap((line) => {
    const normalized = normalizeText(line);
    const isSummaryLine = totalKeywords.some((keyword) => normalized.includes(keyword));
    const isHeaderLine = itemHeaderKeywords.some((keyword) => normalized === keyword || normalized.includes(` ${keyword} `));
    const isMetadataLine =
      shouldIgnoreAmountLine(normalized) ||
      merchantIgnoredKeywords.some((keyword) => normalized.includes(keyword));
    if (isSummaryLine || isHeaderLine || isMetadataLine) return [];

    const amounts = line.match(amountPattern) ?? [];
    if (amounts.length < 2) return [];

    const firstAmountIndex = line.search(amountPattern);
    const name = line.slice(0, firstAmountIndex).replace(/[|:_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (name.length < 2 || /\d{2,}/.test(name)) return [];

    const numbers = amounts.map(parseMoney).filter((amount) => amount > 0);
    if (numbers.length < 2) return [];

    const quantityMatch = line.slice(name.length, firstAmountIndex + 8).match(/\b\d{1,2}\b/);
    const quantity = quantityMatch ? Number(quantityMatch[0]) : 1;

    return [{
      name,
      quantity,
      unitPrice: numbers[numbers.length - 2],
      amount: numbers[numbers.length - 1],
    }];
  });
};

const suggestCategory = (text: string, categories: { name: string }[]) => {
  const normalized = normalizeText(text);
  if (/\b(restaurant|cafe|coffee|food|quan an|nha hang)\b/.test(normalized)) {
    const foodCategory = categories.find((category) => normalizeText(category.name).includes('food'));
    if (foodCategory) return foodCategory.name;
  }

  for (const category of categories) {
    const keywords = categoryKeywords[category.name] ?? [category.name];
    if (keywords.some((keyword) => normalized.includes(normalizeText(keyword)))) {
      return category.name;
    }
  }

  return categories.find((category) => category.name.toLowerCase() === 'others')?.name ?? categories[0]?.name ?? '';
};

const findFallbackCategory = (categories: { name: string }[]) => {
  return categories.find((category) => normalizeText(category.name).includes('other'))?.name ?? categories[0]?.name ?? '';
};

const findUtilityProvider = (lines: string[]) => {
  const providerLine = lines.find((line) => {
    const normalized = normalizeText(line);
    return utilityProviderKeywords.some((keyword) => normalized.includes(keyword)) && !normalized.includes('danh muc');
  });

  if (!providerLine) return 'Utility bill';

  return providerLine
    .replace(/^[<›\s@©]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const findUtilityAmount = (lines: string[]) => {
  const scoredAmounts: Array<{ amount: number; score: number }> = [];

  lines.forEach((line, index) => {
    const normalized = normalizeText(line);
    if (utilityIgnoredAmountKeywords.some((keyword) => normalized.includes(keyword))) return;

    const hasAmountKeyword = utilityAmountKeywords.some((keyword) => normalized.includes(keyword));
    const hasCurrency = /vnd|d\b/i.test(normalized) || line.includes('₫') || line.includes('đ') || line.includes('Ä‘');
    if (!hasAmountKeyword && !hasCurrency) return;

    const matches = getBankAmountMatches(line, hasAmountKeyword || hasCurrency);
    const isProviderLine = utilityProviderKeywords.some((keyword) => normalized.includes(keyword));

    matches.forEach((match) => {
      const amount = parseOcrMoney(match);
      if (amount <= 0 || amount > 100_000_000) return;
      const score = amount + (hasAmountKeyword ? 4_000_000_000 : 0) + (isProviderLine ? 2_000_000_000 : 0) + (hasCurrency ? 700_000_000 : 0) - index;
      scoredAmounts.push({ amount, score });
    });
  });

  if (scoredAmounts.length === 0) return 0;
  scoredAmounts.sort((a, b) => b.score - a.score);
  return scoredAmounts[0].amount;
};

const buildUtilityBillDraft = (rawText: string, categories: { name: string }[]): DraftExpense => {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const description = findUtilityProvider(lines);
  const amount = findUtilityAmount(lines);
  const confidencePieces = [amount > 0, description !== 'Utility bill'].filter(Boolean).length;

  return {
    target: classifyImportTarget(rawText, 'utility_bill'),
    date: getTodayKey(),
    description,
    amount,
    category: findFallbackCategory(categories),
    merchant: description,
    confidence: Math.round((confidencePieces / 2) * 100),
    rawText,
  };
};

const cleanBankDescriptionValue = (line: string) => {
  return line
    .replace(/^(nguoi nhan|den|toi|recipient|beneficiary|noi dung|content|description)\s*[:\-]?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const findBankAmount = (lines: string[]) => {
  const scoredAmounts: Array<{ amount: number; score: number }> = [];

  lines.forEach((line, index) => {
    const normalized = normalizeText(line);
    const hasPrimaryAmountKeyword = bankPrimaryAmountKeywords.some((keyword) => normalized.includes(keyword));
    if (!hasPrimaryAmountKeyword && bankIgnoredAmountKeywords.some((keyword) => normalized.includes(keyword))) return;

    const matches = getBankAmountMatches(line, hasPrimaryAmountKeyword);
    const hasAmountKeyword = bankAmountKeywords.some((keyword) => normalized.includes(keyword));
    const hasIncomingSign = /\+\s*\d/.test(line);
    const hasCurrency = /vnd|d\b/i.test(normalized) || line.includes('₫') || line.includes('đ');

    matches.forEach((match) => {
      const amount = parseMoney(match);
      if (amount <= 0 || amount > 100_000_000) return;
      const score =
        amount +
        (hasPrimaryAmountKeyword ? 4_000_000_000 : 0) +
        (hasAmountKeyword ? 2_000_000_000 : 0) +
        (hasIncomingSign ? 1_000_000_000 : 0) +
        (hasCurrency ? 700_000_000 : 0) -
        index;
      scoredAmounts.push({ amount, score });
    });
  });

  if (scoredAmounts.length === 0) return 0;
  scoredAmounts.sort((a, b) => b.score - a.score);
  return scoredAmounts[0].amount;
};

const findBankDescription = (lines: string[]) => {
  for (const line of lines) {
    const normalized = normalizeText(line);
    if (!bankDescriptionKeywords.some((keyword) => normalized.includes(keyword))) continue;
    if (bankIgnoredAmountKeywords.some((keyword) => normalized.includes(keyword))) continue;

    const value = cleanBankDescriptionValue(line);
    if (value && !value.match(amountPattern)) return `Transfer - ${value}`;
  }

  const successfulLine = lines.find((line) => {
    const normalized = normalizeText(line);
    return normalized.includes('giao dich thanh cong') || normalized.includes('thanh cong') || normalized.includes('successful');
  });

  return successfulLine ? 'Transfer - Successful transaction' : 'Bank transfer';
};

const buildBankTransferDraft = (rawText: string, categories: { name: string }[]): DraftExpense => {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const amount = findBankAmount(lines);
  const description = findBankDescription(lines);
  const category = suggestCategory(rawText, categories) || findFallbackCategory(categories);
  const confidencePieces = [amount > 0, description !== 'Bank transfer'].filter(Boolean).length;

  return {
    target: classifyImportTarget(rawText, 'bank_transfer'),
    date: getTodayKey(),
    description,
    amount,
    category,
    merchant: '',
    confidence: Math.round((confidencePieces / 2) * 100),
    rawText,
  };
};

const buildDraft = (rawText: string, categories: { name: string }[]): DraftExpense => {
  const documentType = detectDocumentType(rawText);

  if (documentType === 'utility_bill') {
    return buildUtilityBillDraft(rawText, categories);
  }

  if (documentType === 'bank_transfer') {
    return buildBankTransferDraft(rawText, categories);
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const merchant = findMerchant(lines);
  const amount = findAmount(lines);
  const lineItems = findLineItems(lines);
  const itemNames = lineItems.map((item) => item.name).slice(0, 4);
  const category = suggestCategory(`${merchant}\n${itemNames.join('\n')}\n${rawText}`, categories);
  const confidencePieces = [amount > 0, !!merchant, lineItems.length > 0].filter(Boolean).length;
  const description =
    merchant
      ? merchant
      : itemNames.length > 0
        ? `Bill - ${itemNames.join(', ')}`
        : 'Imported bill';

  return {
    target: classifyImportTarget(rawText, 'receipt'),
    date: getTodayKey(),
    description,
    amount,
    category,
    merchant,
    confidence: Math.round((confidencePieces / 3) * 100),
    rawText,
  };
};

const mergeOcrTexts = (texts: string[]) => {
  const seen = new Set<string>();
  return texts
    .flatMap((text) => text.split(/\r?\n/))
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      const key = normalizeText(line).replace(/\s+/g, ' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join('\n');
};

export const BillImportModal: React.FC<BillImportModalProps> = ({ open, onClose }) => {
  const {
    addBill,
    addDebt,
    addExpense,
    addIncome,
    addSavings,
    categories,
    uiSettings,
  } = useApp();
  const { language } = uiSettings;
  const pasteTargetRef = useRef<HTMLDivElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [drafts, setDrafts] = useState<DraftExpense[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const progressLabel = useMemo(() => {
    if (!busy) return '';
    return `${status || t(language, 'billOcrReading')} ${Math.round(progress * 100)}%`;
  }, [busy, language, progress, status]);

  useEffect(() => {
    if (!open || busy) return;

    const handlePaste = (event: ClipboardEvent) => {
      const pastedFiles = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.type.startsWith('image/'))
        .map((item, index) => {
          const pastedFile = item.getAsFile();
          if (!pastedFile) return null;
          const extension = pastedFile.type.split('/')[1] || 'png';
          return new File([pastedFile], `clipboard-bill-${index + 1}.${extension}`, { type: pastedFile.type });
        })
        .filter((item): item is File => Boolean(item));
      if (pastedFiles.length === 0) return;

      event.preventDefault();
      setFiles((current) => [...current, ...pastedFiles]);
      setDrafts([]);
      setError('');
      setProgress(0);
      setStatus(t(language, 'billPasted'));
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [busy, language, open]);

  if (!open) return null;

  const reset = () => {
    setFiles([]);
    setDrafts([]);
    setBusy(false);
    setProgress(0);
    setStatus('');
    setError('');
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setFiles(selected);
    setDrafts([]);
    setError('');
    setProgress(0);
    setStatus('');
  };

  const handleRemoveFile = (index: number) => {
    if (busy) return;
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setDrafts((current) => current.filter((_, draftIndex) => draftIndex !== index));
    setError('');
    setProgress(0);
    setStatus('');
  };

  const handleRecognize = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError('');
    setDrafts([]);
    setProgress(0);
    setStatus(t(language, 'billOcrPreparing'));

    try {
      const { default: Tesseract } = await import('tesseract.js');
      const nextDrafts: DraftExpense[] = [];

      for (const [index, file] of files.entries()) {
        setStatus(`${t(language, 'billOcrPreparing')} ${index + 1}/${files.length}`);
        const images = [
          { image: file, label: 'original' },
          { image: await preprocessImage(file), label: 'enhanced' },
          { image: await cropTopAmountArea(file), label: 'top' },
        ];
        const passTexts: string[] = [];

        for (const [passIndex, variant] of images.entries()) {
          setStatus(`${t(language, 'billOcrReading')} ${index + 1}/${files.length} (${passIndex + 1}/${images.length})`);
          const result = await Tesseract.recognize(variant.image, 'eng+vie', {
            logger: (message) => {
              if (message.status) {
                setStatus(`${message.status} ${index + 1}/${files.length} (${variant.label})`);
              }
              if (Number.isFinite(message.progress)) {
                setProgress((index + (passIndex + message.progress) / images.length) / files.length);
              }
            },
          });
          passTexts.push(result.data.text.trim());
        }

        const text = mergeOcrTexts(passTexts);
        if (text) {
          nextDrafts.push(buildDraft(text, categories));
        }
      }

      if (nextDrafts.length === 0) {
        setError(t(language, 'billOcrNoText'));
        return;
      }
      setDrafts(nextDrafts);
      setProgress(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(language, 'billOcrError'));
    } finally {
      setBusy(false);
    }
  };

  const handleDraftChange = (index: number, field: keyof Pick<DraftExpense, 'target' | 'date' | 'description' | 'amount' | 'category'>, value: string) => {
    setDrafts((current) => current.map((draft, draftIndex) => {
      if (draftIndex !== index) return draft;
      if (field === 'target') {
        return { ...draft, target: value as ImportTarget };
      }
      if (field === 'amount') {
        return { ...draft, amount: parseMoney(value) };
      }
      return { ...draft, [field]: value };
    }));
  };

  const handleAdd = () => {
    const validDrafts = drafts.filter((draft) => draft.amount > 0);
    if (validDrafts.length === 0) return;
    validDrafts.forEach((draft) => {
      const description = draft.description.trim() || 'Imported item';
      if (draft.target === 'expense') {
        addExpense({
          date: draft.date,
          description,
          amount: draft.amount,
          category: draft.category,
        });
        return;
      }

      if (draft.target === 'bill') {
        addBill({
          date: draft.date,
          description,
          amount: draft.amount,
        });
        return;
      }

      if (draft.target === 'debt') {
        addDebt({
          date: draft.date,
          description,
          amount: draft.amount,
        });
        return;
      }

      if (draft.target === 'income') {
        addIncome({
          description,
          amount: draft.amount,
        });
        return;
      }

      addSavings({
        description,
        amount: draft.amount,
      });
    });
    handleClose();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatTargetLabel = (target: ImportTarget) => {
    const targetLabels: Record<ImportTarget, string> = {
      expense: t(language, 'expense'),
      bill: t(language, 'bills'),
      income: t(language, 'income'),
      debt: t(language, 'debt'),
      savings: t(language, 'savings'),
    };
    return targetLabels[target];
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/45 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl border border-ink-200/70 bg-white p-6 shadow-float dark:border-ink-700/70 dark:bg-ink-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="section-title font-heading">{t(language, 'billImportTitle')}</h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{t(language, 'billImportSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-ink-900/10 px-3 py-1 text-xs font-semibold text-ink-700 hover:bg-ink-900/20 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            disabled={busy}
          >
            {t(language, 'close')}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
              {t(language, 'billImage')}
            </label>
            <div
              ref={pasteTargetRef}
              tabIndex={0}
              className="mb-3 rounded-xl border border-dashed border-ink-300 bg-ink-50/60 px-4 py-3 text-sm font-medium text-ink-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-300 dark:border-ink-600 dark:bg-ink-800/80 dark:text-ink-100"
              onClick={() => pasteTargetRef.current?.focus()}
            >
              {files.length > 0 ? t(language, 'billSelectedImages') : t(language, 'billPasteHint')}
            </div>
            {files.length > 0 && (
              <div className="mb-3 flex flex-col gap-2">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-ink-200/70 bg-white px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-800/80">
                    <span className="min-w-0 flex-1 truncate font-medium text-ink-800 dark:text-ink-100">
                      {index + 1}. {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/20 dark:text-rose-100 dark:hover:bg-rose-500/30"
                      disabled={busy}
                    >
                      {t(language, 'removeRow')}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="input"
              disabled={busy}
            />
          </div>

          {busy && (
            <div className="rounded-xl border border-teal-200/70 bg-teal-50/80 p-3 dark:border-teal-500/30 dark:bg-teal-500/10">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-teal-800 dark:text-teal-200">
                <span>{progressLabel}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white dark:bg-ink-800">
                <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${Math.max(4, progress * 100)}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
              {error}
            </div>
          )}

          {drafts.map((draft, index) => (
            <div key={`${draft.description}-${index}`} className="grid gap-4 rounded-xl border border-ink-200/70 bg-sand-50/70 p-4 shadow-soft dark:border-ink-600/70 dark:bg-ink-800/70 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-200">
                  {t(language, 'billDraft')} {index + 1}
                </p>
                <span className="text-xs font-semibold text-ink-500 dark:text-teal-200">{t(language, 'billConfidence')}: {draft.confidence}%</span>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300 mb-2">{t(language, 'importTo')}</label>
                <select value={draft.target} onChange={(e) => handleDraftChange(index, 'target', e.target.value)} className="input">
                  {importTargets.map((target) => (
                    <option key={target} value={target}>
                      {formatTargetLabel(target)}
                    </option>
                  ))}
                </select>
              </div>
              {(draft.target === 'expense' || draft.target === 'bill' || draft.target === 'debt') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300 mb-2">
                    {draft.target === 'expense' ? t(language, 'date') : t(language, 'dueDate')}
                  </label>
                  <input type="date" value={draft.date} onChange={(e) => handleDraftChange(index, 'date', e.target.value)} className="input" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300 mb-2">{t(language, 'amount')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draft.amount ? formatCurrency(draft.amount) : ''}
                  onChange={(e) => handleDraftChange(index, 'amount', e.target.value)}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300 mb-2">{t(language, 'description')}</label>
                <input value={draft.description} onChange={(e) => handleDraftChange(index, 'description', e.target.value)} className="input" />
              </div>
              {draft.target === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300 mb-2">{t(language, 'category')}</label>
                  <select value={draft.category} onChange={(e) => handleDraftChange(index, 'category', e.target.value)} className="input">
                    <option value="">{t(language, 'select')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300">{t(language, 'billRawText')}</label>
                <textarea className="input min-h-[110px] text-xs" value={draft.rawText} readOnly />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleRecognize}
            className="btn-ghost disabled:opacity-50 disabled:pointer-events-none"
            disabled={files.length === 0 || busy}
          >
            {t(language, 'billScan')}
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="btn-primary disabled:opacity-50 disabled:pointer-events-none"
            disabled={drafts.every((draft) => draft.amount <= 0) || busy}
          >
            {t(language, 'billAddExpense')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
