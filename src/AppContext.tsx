import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { AppState, IncomeItem, DebtItem, SavingsItem, BillItem, ExpenseItem, Sheet, AllowanceSnapshot, ShareSettings, ShareVisibility } from './types';
import { auth, db } from './firebase';
import { cloneCategoriesForNewSheet, getSheetTotals, reconcileCategories, toNumber } from './domain';

interface AppContextType extends AppState, Sheet {
  currentSheet: Sheet;
  setCurrentSheet: (id: string) => void;
  addSheet: (name?: string, categorySourceSheetId?: string) => void;
  renameSheet: (id: string, name: string) => void;
  removeSheet: (id: string) => void;
  setExpenseRowCount: (count: number) => void;
  addIncome: (item: Omit<IncomeItem, 'id'>) => void;
  removeIncome: (id: string) => void;
  updateIncome: (id: string, item: Partial<Omit<IncomeItem, 'id'>>) => void;
  addDebt: (item: Omit<DebtItem, 'id'>) => void;
  removeDebt: (id: string) => void;
  updateDebt: (id: string, item: Partial<Omit<DebtItem, 'id'>>) => void;
  addSavings: (item: Omit<SavingsItem, 'id'>) => void;
  removeSavings: (id: string) => void;
  updateSavings: (id: string, item: Partial<Omit<SavingsItem, 'id'>>) => void;
  addBill: (item: Omit<BillItem, 'id'>) => void;
  removeBill: (id: string) => void;
  updateBill: (id: string, item: Partial<Omit<BillItem, 'id'>>) => void;
  addExpense: (item: Omit<ExpenseItem, 'id'>) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, item: Partial<Omit<ExpenseItem, 'id'>>) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void;
  updatePeriod: (startDate: string, endDate: string) => void;
  getTotalIncome: () => number;
  getTotalSavings: () => number;
  getTotalExpenses: () => number;
  getRemainingAmount: () => number;
  setDailyAllowanceSnapshot: (snapshot: AllowanceSnapshot) => void;
  user: User | null;
  authLoading: boolean;
  dataLoading: boolean;
  dataError: string | null;
  saveStatus: SaveStatus;
  shareLoading: boolean;
  shareError: string | null;
  readOnly: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  enableShare: (visibility: ShareVisibility, allowedEmails: string[]) => Promise<void>;
  disableShare: () => Promise<void>;
  signOut: () => Promise<void>;
  themeTransitionId: number;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  setLanguage: (language: 'en' | 'vi') => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'local' | 'error';

const AppContext = createContext<AppContextType | undefined>(undefined);
const DEFAULT_EXPENSE_ROW_COUNT = 50;

const defaultCategories = [
  { id: '1', name: 'Food & Dining', total: 0 },
  { id: '2', name: 'Transportation', total: 0 },
  { id: '3', name: 'Shopping', total: 0 },
  { id: '4', name: 'Entertainment', total: 0 },
  { id: '5', name: 'Healthcare', total: 0 },
  { id: '6', name: 'Others', total: 0 },
];

const createDefaultSheet = (name: string): Sheet => ({
  id: Date.now().toString(36) + Math.random().toString(36).substr(2),
  name,
  periodSettings: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  },
  expenseRowCount: DEFAULT_EXPENSE_ROW_COUNT,
  income: [],
  debts: [],
  savings: [],
  bills: [],
  expenses: [],
  categories: defaultCategories.map(cat => ({ ...cat })),
  allowanceSnapshot: undefined,
  share: undefined,
});

const createDefaultState = (): AppState => {
  const defaultSheet = createDefaultSheet('Current Month');
  return {
    sheets: [defaultSheet],
    currentSheetId: defaultSheet.id,
    uiSettings: {
      theme: 'light',
      language: 'en',
    },
  };
};

const normalizeSheet = (sheet: Sheet): Sheet => reconcileCategories({
  ...sheet,
  expenseRowCount: Math.max(
    DEFAULT_EXPENSE_ROW_COUNT,
    toNumber(sheet.expenseRowCount),
    sheet.expenses.length
  ),
  income: sheet.income.map(item => ({ ...item, amount: toNumber(item.amount) })),
  debts: sheet.debts.map(item => ({ ...item, amount: toNumber(item.amount) })),
  savings: sheet.savings.map(item => ({ ...item, amount: toNumber(item.amount) })),
  bills: sheet.bills.map(item => ({ ...item, amount: toNumber(item.amount) })),
  expenses: sheet.expenses.map(item => ({ ...item, amount: toNumber(item.amount) })),
  categories: sheet.categories.map(item => ({ ...item, total: toNumber(item.total) })),
  allowanceSnapshot: sheet.allowanceSnapshot
    ? { ...sheet.allowanceSnapshot, amount: toNumber(sheet.allowanceSnapshot.amount) }
    : sheet.allowanceSnapshot,
});

const buildStateFromData = (parsed?: Partial<AppState> & Partial<Sheet>): AppState => {
  const baseState = createDefaultState();
  if (parsed?.sheets && parsed.sheets.length > 0) {
    return {
      ...baseState,
      ...parsed,
      sheets: parsed.sheets.map(sheet => normalizeSheet(sheet)),
      currentSheetId: parsed.currentSheetId ?? parsed.sheets[0].id,
      uiSettings: {
        ...baseState.uiSettings,
        ...(parsed.uiSettings ?? {}),
      },
    };
  }

  if (!parsed) return baseState;

  const legacySheet: Sheet = {
    id: baseState.sheets[0].id,
    name: 'Current Month',
    periodSettings: parsed.periodSettings ?? baseState.sheets[0].periodSettings,
    expenseRowCount: Math.max(
      DEFAULT_EXPENSE_ROW_COUNT,
      toNumber(parsed.expenseRowCount),
      (parsed.expenses ?? []).length
    ),
    income: (parsed.income ?? []).map(item => ({ ...item, amount: toNumber(item.amount) })),
    debts: (parsed.debts ?? []).map(item => ({ ...item, amount: toNumber(item.amount) })),
    savings: (parsed.savings ?? []).map(item => ({ ...item, amount: toNumber(item.amount) })),
    bills: (parsed.bills ?? []).map(item => ({ ...item, amount: toNumber(item.amount) })),
    expenses: (parsed.expenses ?? []).map(item => ({ ...item, amount: toNumber(item.amount) })),
    categories: (parsed.categories ?? defaultCategories.map(cat => ({ ...cat }))).map(item => ({ ...item, total: toNumber(item.total) })),
    allowanceSnapshot: parsed.allowanceSnapshot
      ? { ...parsed.allowanceSnapshot, amount: toNumber(parsed.allowanceSnapshot.amount) }
      : parsed.allowanceSnapshot,
    share: parsed.share,
  };

  return {
    ...baseState,
    sheets: [normalizeSheet(legacySheet)],
    currentSheetId: legacySheet.id,
    uiSettings: {
      ...baseState.uiSettings,
      ...(parsed.uiSettings ?? {}),
    },
  };
};

const sanitizeState = <T,>(value: T): T => {
  // Firestore rejects undefined values; JSON round-trip strips them.
  return JSON.parse(JSON.stringify(value)) as T;
};

const getLocalStateKey = (uid: string) => `trackly-state-${uid}`;

type LocalStateBackup = { state: AppState; pending: boolean };

const readLocalState = (uid: string): LocalStateBackup | null => {
  try {
    const value = window.localStorage.getItem(getLocalStateKey(uid));
    if (!value) return null;
    const parsed = JSON.parse(value) as {
      version?: number;
      state?: Partial<AppState> & Partial<Sheet>;
      pending?: boolean;
    } & Partial<AppState> & Partial<Sheet>;
    if (parsed.version === 1 && parsed.state) {
      return { state: buildStateFromData(parsed.state), pending: parsed.pending === true };
    }
    return { state: buildStateFromData(parsed), pending: false };
  } catch {
    return null;
  }
};

const writeLocalState = (uid: string, value: AppState, pending: boolean) => {
  try {
    window.localStorage.setItem(getLocalStateKey(uid), JSON.stringify(sanitizeState({
      version: 1,
      state: value,
      pending,
      savedAt: Date.now(),
    })));
  } catch {
    // IndexedDB remains the primary offline cache when localStorage is unavailable or full.
  }
};

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      value => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      error => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => createDefaultState());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [shareLoading, setShareLoading] = useState(
    () => new URLSearchParams(window.location.search).has('share')
  );
  const [shareError, setShareError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [sharedSheet, setSharedSheet] = useState<Sheet | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [themeTransitionId, setThemeTransitionId] = useState(0);
  const persistedSheetIdsRef = useRef<Set<string>>(new Set());
  const authSequenceRef = useRef(0);
  const skipNextSaveRef = useRef(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async authUser => {
      const sequence = ++authSequenceRef.current;
      setUser(authUser);
      setDataError(null);
      setSaveStatus('idle');
      if (!authUser) {
        setState(createDefaultState());
        setDataLoading(false);
        setHydrated(false);
        setAuthLoading(false);
        return;
      }

      setDataLoading(true);
      setHydrated(false);
      const localBackup = readLocalState(authUser.uid);
      const localState = localBackup?.state ?? null;
      try {
        const ref = doc(db, 'users', authUser.uid);
        const sheetsPromise = getDocs(collection(db, 'users', authUser.uid, 'sheets'));
        const snap = await withTimeout(getDoc(ref), 8000, 'Cloud data timed out.');
        if (sequence !== authSequenceRef.current) return;
        if (snap.exists()) {
          const rootData = snap.data() as Partial<AppState> & Partial<Sheet> & { schemaVersion?: number };
          let sheetDocs: Sheet[] = [];
          try {
            const sheetsSnapshot = await withTimeout(sheetsPromise, 2500, 'Sheet data timed out.');
            sheetDocs = sheetsSnapshot.docs.map(sheetDoc => sheetDoc.data() as Sheet);
          } catch {
            // Legacy root documents remain readable when subcollection rules are not deployed yet.
          }

          if (rootData.schemaVersion === 2 && sheetDocs.length === 0) {
            throw new Error('Sheet data is unavailable.');
          }

          const remoteState = buildStateFromData(sheetDocs.length > 0
            ? { ...rootData, sheets: sheetDocs }
            : rootData);
          setState(remoteState);
          writeLocalState(authUser.uid, remoteState, false);
          persistedSheetIdsRef.current = new Set(remoteState.sheets.map(sheet => sheet.id));
          skipNextSaveRef.current = true;
        } else {
          const initialState = localState ?? createDefaultState();
          setState(initialState);
          persistedSheetIdsRef.current = new Set();
          skipNextSaveRef.current = !!localState && !localBackup?.pending;
        }
        setHydrated(true);
      } catch {
        if (sequence !== authSequenceRef.current) return;
        if (localState) {
          setState(localState);
          persistedSheetIdsRef.current = new Set(localState.sheets.map(sheet => sheet.id));
          skipNextSaveRef.current = !localBackup?.pending;
          setHydrated(true);
          setSaveStatus('local');
        } else {
          setDataError('Unable to load your data. Check the connection and try again.');
        }
      } finally {
        if (sequence === authSequenceRef.current) {
          setDataLoading(false);
          setAuthLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (!shareId) {
      setShareError(null);
      setShareLoading(false);
      setReadOnly(false);
      setSharedSheet(null);
      return;
    }

    const loadShare = async () => {
      setShareLoading(true);
      setShareError(null);
      try {
        const ref = doc(db, 'shares', shareId);
        const snap = await withTimeout(getDoc(ref), 8000, 'Share data timed out.');
        if (!snap.exists()) {
          setShareError('Share link is invalid.');
          setSharedSheet(null);
          setReadOnly(false);
          return;
        }
        const data = snap.data() as {
          visibility: ShareVisibility;
          allowedEmails?: string[];
          sheet: Sheet;
          ownerUid: string;
        };

        const visibility = data.visibility;
        const allowedEmails = (data.allowedEmails ?? []).map(email => email.toLowerCase());
        const userEmail = user?.email?.toLowerCase() ?? '';

        const canAccess =
          visibility === 'public' ||
          (visibility === 'restricted' && !!user) ||
          (visibility === 'invited' && !!user && allowedEmails.includes(userEmail));

        if (!canAccess) {
          if (!user && (visibility === 'restricted' || visibility === 'invited')) {
            setShareError(null);
            setSharedSheet(null);
            setReadOnly(false);
            return;
          }
          setShareError('You do not have access to this shared sheet.');
          setSharedSheet(null);
          setReadOnly(false);
          return;
        }

        setSharedSheet(normalizeSheet(data.sheet));
        setReadOnly(true);
      } catch (error) {
        if (error instanceof FirebaseError && error.code === 'permission-denied') {
          if (!user) {
            setShareError(null);
          } else {
            setShareError('Share access denied. If this link is restricted, make sure you are signed in. If it should be public, allow public reads in Firestore rules.');
          }
        } else {
          setShareError('Unable to load shared sheet.');
        }
        setSharedSheet(null);
        setReadOnly(false);
      } finally {
        setShareLoading(false);
      }
    };

    if (authLoading) return;
    loadShare();
  }, [authLoading, user]);

  useEffect(() => {
    if (!user || !hydrated || readOnly) return;
    writeLocalState(user.uid, state, true);
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    setSaveStatus('saving');

    const timeoutId = window.setTimeout(async () => {
      const saveToSubcollections = async () => {
        const batch = writeBatch(db);
        batch.set(doc(db, 'users', user.uid), sanitizeState({
          schemaVersion: 2,
          currentSheetId: state.currentSheetId,
          uiSettings: state.uiSettings,
          updatedAt: Date.now(),
        }));
        state.sheets.forEach(sheet => {
          batch.set(doc(db, 'users', user.uid, 'sheets', sheet.id), sanitizeState(sheet));
        });
        persistedSheetIdsRef.current.forEach(sheetId => {
          if (!state.sheets.some(sheet => sheet.id === sheetId)) {
            batch.delete(doc(db, 'users', user.uid, 'sheets', sheetId));
          }
        });
        await batch.commit();
        persistedSheetIdsRef.current = new Set(state.sheets.map(sheet => sheet.id));
      };

      try {
        try {
          await withTimeout(saveToSubcollections(), 6000, 'Cloud save timed out.');
        } catch (error) {
          if (error instanceof FirebaseError && error.code === 'permission-denied') {
            await withTimeout(
              setDoc(doc(db, 'users', user.uid), sanitizeState(state)),
              6000,
              'Cloud save timed out.'
            );
          } else {
            throw error;
          }
        }

        const current = getCurrentSheet(state);
        if (current.share?.id) {
          const shareDoc = {
            ownerUid: user.uid,
            sheetId: current.id,
            sheetName: current.name,
            visibility: current.share.visibility,
            allowedEmails: current.share.allowedEmails,
            sheet: { ...current, share: current.share },
            updatedAt: Date.now(),
          };
          await withTimeout(
            setDoc(doc(db, 'shares', current.share.id), sanitizeState(shareDoc)),
            6000,
            'Share save timed out.'
          );
        }
        writeLocalState(user.uid, state, false);
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus(error instanceof FirebaseError && error.code !== 'unavailable' ? 'error' : 'local');
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [hydrated, readOnly, state, user]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(state.uiSettings.theme);
    if (state.uiSettings.theme === 'dark') {
      root.classList.add('dark');
    }
    root.style.colorScheme = state.uiSettings.theme;
  }, [state.uiSettings.theme]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  const generateShareId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  const getCurrentSheet = (s: AppState) => s.sheets.find(sheet => sheet.id === s.currentSheetId) ?? s.sheets[0];

  const setCurrentSheet = (id: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      currentSheetId: prev.sheets.some(sheet => sheet.id === id) ? id : prev.currentSheetId,
    }));
  };

  const addSheet = (name?: string, categorySourceSheetId?: string) => {
    if (readOnly) return;
    setState(prev => {
      const sheetName = name?.trim() || `Sheet ${prev.sheets.length + 1}`;
      const newSheet = createDefaultSheet(sheetName);
      const categorySource = categorySourceSheetId
        ? prev.sheets.find(sheet => sheet.id === categorySourceSheetId)
        : undefined;

      if (categorySource) {
        newSheet.categories = cloneCategoriesForNewSheet(categorySource.categories, generateId);
      }

      return {
        ...prev,
        sheets: [...prev.sheets, newSheet],
        currentSheetId: newSheet.id,
      };
    });
  };

  const renameSheet = (id: string, name: string) => {
    if (readOnly) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === id ? { ...sheet, name: trimmedName } : sheet
      ),
    }));
  };

  const removeSheet = (id: string) => {
    if (readOnly) return;
    setState(prev => {
      if (prev.sheets.length <= 1) return prev;
      const remainingSheets = prev.sheets.filter(sheet => sheet.id !== id);
      if (remainingSheets.length === prev.sheets.length) return prev;
      const nextSheetId = prev.currentSheetId === id ? remainingSheets[0].id : prev.currentSheetId;
      return {
        ...prev,
        sheets: remainingSheets,
        currentSheetId: nextSheetId,
      };
    });
  };

  const setExpenseRowCount = (count: number) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, expenseRowCount: Math.max(1, count, sheet.expenses.length) }
          : sheet
      ),
    }));
  };

  const addIncome = (item: Omit<IncomeItem, 'id'>) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, income: [...sheet.income, { ...item, id: generateId() }] }
          : sheet
      ),
    }));
  };

  const removeIncome = (id: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, income: sheet.income.filter(item => item.id !== id) }
          : sheet
      ),
    }));
  };

  const updateIncome = (id: string, item: Partial<Omit<IncomeItem, 'id'>>) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, income: sheet.income.map(inc => inc.id === id ? { ...inc, ...item } : inc) }
          : sheet
      ),
    }));
  };

  const addDebt = (item: Omit<DebtItem, 'id'>) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, debts: [...sheet.debts, { ...item, id: generateId() }] }
          : sheet
      ),
    }));
  };

  const removeDebt = (id: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, debts: sheet.debts.filter(item => item.id !== id) }
          : sheet
      ),
    }));
  };

  const updateDebt = (id: string, item: Partial<Omit<DebtItem, 'id'>>) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, debts: sheet.debts.map(debt => debt.id === id ? { ...debt, ...item } : debt) }
          : sheet
      ),
    }));
  };

  const addSavings = (item: Omit<SavingsItem, 'id'>) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, savings: [...sheet.savings, { ...item, id: generateId() }] }
          : sheet
      ),
    }));
  };

  const removeSavings = (id: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, savings: sheet.savings.filter(item => item.id !== id) }
          : sheet
      ),
    }));
  };

  const updateSavings = (id: string, item: Partial<Omit<SavingsItem, 'id'>>) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, savings: sheet.savings.map(sav => sav.id === id ? { ...sav, ...item } : sav) }
          : sheet
      ),
    }));
  };

  const addBill = (item: Omit<BillItem, 'id'>) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, bills: [...sheet.bills, { ...item, id: generateId() }] }
          : sheet
      ),
    }));
  };

  const removeBill = (id: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, bills: sheet.bills.filter(item => item.id !== id) }
          : sheet
      ),
    }));
  };

  const updateBill = (id: string, item: Partial<Omit<BillItem, 'id'>>) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, bills: sheet.bills.map(bill => bill.id === id ? { ...bill, ...item } : bill) }
          : sheet
      ),
    }));
  };

  const addExpense = (item: Omit<ExpenseItem, 'id'>) => {
    if (readOnly) return;
    setState(prev => {
      const updatedSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.currentSheetId) return sheet;
        const category = sheet.categories.find(cat => cat.id === item.categoryId)
          ?? sheet.categories.find(cat => cat.name === item.category);
        return reconcileCategories({
          ...sheet,
          expenses: [...sheet.expenses, {
            ...item,
            id: generateId(),
            categoryId: category?.id,
            category: category?.name ?? item.category,
          }],
        });
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  const removeExpense = (id: string) => {
    if (readOnly) return;
    setState(prev => {
      const updatedSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.currentSheetId) return sheet;
        if (!sheet.expenses.some(expense => expense.id === id)) return sheet;
        return reconcileCategories({
          ...sheet,
          expenses: sheet.expenses.filter(item => item.id !== id),
        });
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  const updateExpense = (id: string, item: Partial<Omit<ExpenseItem, 'id'>>) => {
    if (readOnly) return;
    setState(prev => {
      const updatedSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.currentSheetId) return sheet;
        const oldExpense = sheet.expenses.find(e => e.id === id);
        if (!oldExpense) return sheet;

        const updatedExpense = { ...oldExpense, ...item };
        const category = item.category !== undefined
          ? sheet.categories.find(cat => cat.name === item.category)
          : sheet.categories.find(cat => cat.id === updatedExpense.categoryId)
            ?? sheet.categories.find(cat => cat.name === updatedExpense.category);
        return reconcileCategories({
          ...sheet,
          expenses: sheet.expenses.map(exp => exp.id === id
            ? { ...updatedExpense, categoryId: category?.id, category: category?.name ?? updatedExpense.category }
            : exp),
        });
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  const addCategory = (name: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, categories: [...sheet.categories, { id: generateId(), name, total: 0 }] }
          : sheet
      ),
    }));
  };

  const removeCategory = (id: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet => {
        if (sheet.id !== prev.currentSheetId) return sheet;
        const removed = sheet.categories.find(category => category.id === id);
        if (!removed) return sheet;
        const remaining = sheet.categories.filter(category => category.id !== id);
        const fallback = remaining.find(category => category.name.toLowerCase() === 'others');
        return reconcileCategories({
          ...sheet,
          categories: remaining,
          expenses: sheet.expenses.map(expense =>
            expense.categoryId === id || (!expense.categoryId && expense.category === removed.name)
              ? { ...expense, categoryId: fallback?.id, category: fallback?.name ?? '' }
              : expense
          ),
        });
      }),
    }));
  };

  const updateCategory = (id: string, name: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet => {
        if (sheet.id !== prev.currentSheetId) return sheet;
        const oldCategory = sheet.categories.find(category => category.id === id);
        if (!oldCategory) return sheet;
        return reconcileCategories({
          ...sheet,
          categories: sheet.categories.map(category => category.id === id ? { ...category, name } : category),
          expenses: sheet.expenses.map(expense =>
            expense.categoryId === id || (!expense.categoryId && expense.category === oldCategory.name)
              ? { ...expense, categoryId: id, category: name }
              : expense
          ),
        });
      }),
    }));
  };

  const updatePeriod = (startDate: string, endDate: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, periodSettings: { startDate, endDate } }
          : sheet
      ),
    }));
  };

  const getTotalIncome = () => {
    const sheet = sharedSheet ?? getCurrentSheet(state);
    return getSheetTotals(sheet).income;
  };

  const getTotalSavings = () => {
    const sheet = sharedSheet ?? getCurrentSheet(state);
    return getSheetTotals(sheet).savings;
  };

  const getTotalExpenses = () => {
    const sheet = sharedSheet ?? getCurrentSheet(state);
    return getSheetTotals(sheet).expenses;
  };

  const getRemainingAmount = () => {
    const sheet = sharedSheet ?? getCurrentSheet(state);
    return getSheetTotals(sheet).remaining;
  };

  const setDailyAllowanceSnapshot = (snapshot: AllowanceSnapshot) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, allowanceSnapshot: snapshot }
          : sheet
      ),
    }));
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setState(prev => ({
      ...prev,
      uiSettings: { ...prev.uiSettings, theme },
    }));
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user) {
      await sendEmailVerification(credential.user);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const enableShare = async (visibility: ShareVisibility, allowedEmails: string[]) => {
    if (!user) throw new Error('Sign in required');
    const current = getCurrentSheet(state);
    const shareId = current.share?.id ?? generateShareId();
    const share: ShareSettings = {
      id: shareId,
      visibility,
      allowedEmails,
    };

    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId ? { ...sheet, share } : sheet
      ),
    }));

    const shareDoc = {
      ownerUid: user.uid,
      sheetId: current.id,
      sheetName: current.name,
      visibility: share.visibility,
      allowedEmails: share.allowedEmails,
      sheet: { ...current, share },
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'shares', shareId), sanitizeState(shareDoc));
  };

  const disableShare = async () => {
    if (!user) return;
    const current = getCurrentSheet(state);
    if (!current.share?.id) return;
    await deleteDoc(doc(db, 'shares', current.share.id));
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId ? { ...sheet, share: undefined } : sheet
      ),
    }));
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const toggleTheme = (origin?: { x: number; y: number }) => {
    setThemeTransitionId(prev => prev + 1);
    if (origin) {
      const root = document.documentElement;
      root.style.setProperty('--spotlight-x', `${origin.x}px`);
      root.style.setProperty('--spotlight-y', `${origin.y}px`);
    }
    const nextTheme = state.uiSettings.theme === 'dark' ? 'light' : 'dark';
    window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        uiSettings: { ...prev.uiSettings, theme: nextTheme },
      }));
    }, 520);
  };

  const setLanguage = (language: 'en' | 'vi') => {
    setState(prev => ({
      ...prev,
      uiSettings: { ...prev.uiSettings, language },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        ...(sharedSheet ?? getCurrentSheet(state)),
        currentSheet: sharedSheet ?? getCurrentSheet(state),
        sheets: sharedSheet ? [sharedSheet] : state.sheets,
        currentSheetId: sharedSheet ? sharedSheet.id : state.currentSheetId,
        setCurrentSheet,
        addSheet,
        renameSheet,
        removeSheet,
        setExpenseRowCount,
        addIncome,
        removeIncome,
        updateIncome,
        addDebt,
        removeDebt,
        updateDebt,
        addSavings,
        removeSavings,
        updateSavings,
        addBill,
        removeBill,
        updateBill,
        addExpense,
        removeExpense,
        updateExpense,
        addCategory,
        removeCategory,
        updateCategory,
        updatePeriod,
        getTotalIncome,
        getTotalSavings,
        getTotalExpenses,
        getRemainingAmount,
        setDailyAllowanceSnapshot,
        user,
        authLoading,
        dataLoading,
        dataError,
        saveStatus,
        shareLoading,
        shareError,
        readOnly,
        signIn,
        register,
        sendPasswordReset,
        resendVerification,
        enableShare,
        disableShare,
        signOut,
        themeTransitionId,
        setTheme,
        toggleTheme,
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
