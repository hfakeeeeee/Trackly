import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ConfirmToast } from './ConfirmToast';
import { t } from '../i18n';

export const Income: React.FC = () => {
  const { income, addIncome, removeIncome, updateIncome, getTotalIncome, uiSettings } = useApp();
  const [maxRows, setMaxRows] = useState(5);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { language } = uiSettings;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCellChange = (index: number, field: 'description' | 'amount', value: string) => {
    const existingItem = income[index];
    
    if (existingItem) {
      // Update existing item
      if (field === 'description') {
        if (value.trim() === '' && (!existingItem.amount || existingItem.amount === 0)) {
          removeIncome(existingItem.id);
        } else {
          updateIncome(existingItem.id, { description: value });
        }
      } else {
        const numValue = parseFloat(value) || 0;
        if (numValue === 0 && !existingItem.description.trim()) {
          removeIncome(existingItem.id);
        } else {
          updateIncome(existingItem.id, { amount: numValue });
        }
      }
    } else {
      // Create new item
      if (field === 'description' && value.trim()) {
        addIncome({ description: value, amount: 0 });
      } else if (field === 'amount' && value) {
        const numValue = parseFloat(value) || 0;
        if (numValue > 0) {
          addIncome({ description: '', amount: numValue });
        }
      }
    }
  };

  const handleClearAll = () => {
    if (income.length === 0) return;
    setConfirmOpen(true);
  };

  const handleConfirmClearAll = () => {
    income.forEach((item) => removeIncome(item.id));
    setConfirmOpen(false);
  };

  const handleRemoveRow = (index: number) => {
    const item = income[index];
    if (item) {
      removeIncome(item.id);
    }
    setMaxRows((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const renderRow = (index: number) => {
    const item = income[index];
    
    return (
      <tr key={index} className="table-row">
        <td className="py-2 px-3 border-r border-ink-100/70">
          <input
            type="text"
            value={item?.description || ''}
            onChange={(e) => handleCellChange(index, 'description', e.target.value)}
            className="input-ghost"
            placeholder={t(language, 'enterDescription')}
          />
        </td>
        <td className="py-2 px-3 border-r border-ink-100/70">
          <input
            type="number"
            step="1"
            value={item?.amount || ''}
            onChange={(e) => handleCellChange(index, 'amount', e.target.value)}
            className="input-ghost text-right tabular-nums"
            placeholder="0"
          />
        </td>
        <td className="py-2 px-3 text-center">
          <div className="flex items-center justify-center gap-2">
            {item ? (
              <button
                onClick={() => removeIncome(item.id)}
                className="text-amber-600 hover:text-amber-700 font-medium p-1 transition-transform duration-200 hover:scale-110 active:scale-95"
                title={t(language, 'clearRow')}
              >
                <svg className="w-5 h-5 transition-transform duration-200 hover:-rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H8m0 0l3.5-3.5M8 12l3.5 3.5M4 20h10a2 2 0 002-2v-2" />
                </svg>
              </button>
            ) : null}
            <button
              onClick={() => handleRemoveRow(index)}
              className={`text-rose-600 hover:text-rose-700 font-medium p-1 transition-transform duration-200 hover:scale-110 active:scale-95 ${maxRows <= 1 ? 'opacity-40 pointer-events-none' : ''}`}
              title={t(language, 'removeRow')}
            >
              <svg className="w-5 h-5 transition-transform duration-200 hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M10 10v6M14 10v6" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <section className="card card-pad mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title font-heading">{t(language, 'income')}</h2>
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => setMaxRows(maxRows + 1)}
            className="btn-ghost group transition-transform duration-200 hover:scale-105 active:scale-95"
            title={t(language, 'addRow')}
          >
            <svg className="w-5 h-5 animate-pop-in transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleClearAll}
            className="btn-ghost text-rose-600 hover:text-rose-700"
            title={t(language, 'confirmClearIncome')}
          >
            {t(language, 'clearAll')}
          </button>
          <div className="rounded-full border border-teal-200/60 bg-teal-50/70 px-4 py-2 dark:bg-teal-500/10 dark:border-teal-500/30">
            <span className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">{t(language, 'total')}</span>
            <span className="ml-2 text-sm font-bold text-teal-800 dark:text-teal-300">{formatCurrency(getTotalIncome())}</span>
          </div>
          <ConfirmToast
            open={confirmOpen}
            message={t(language, 'confirmClearIncome')}
            subtext={t(language, 'confirmSubtext')}
            confirmLabel={t(language, 'clearAll')}
            cancelLabel={t(language, 'cancel')}
            positionClassName="absolute right-0 top-full mt-2 z-50"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmClearAll}
          />
        </div>
      </div>

      <div className="table-shell">
        <table className="w-full">
          <thead className="table-head">
            <tr className="border-b border-ink-100/80">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">{t(language, 'description')}</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-40 border-r border-ink-100/70">{t(language, 'amount')}</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-20">{t(language, 'action')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }, (_, index) => renderRow(index))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
