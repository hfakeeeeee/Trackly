import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ConfirmToast } from './ConfirmToast';
import { t } from '../i18n';

export const ExpenseTracker: React.FC = () => {
  const { expenses, categories, addExpense, removeExpense, updateExpense, uiSettings } = useApp();
  const [maxRows, setMaxRows] = useState(50);
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

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleCellChange = (index: number, field: 'date' | 'description' | 'category' | 'amount', value: string) => {
    const existingItem = expenses[index];
    
    if (existingItem) {
      // Update existing item
      if (field === 'date') {
        if (!value && !existingItem.description.trim() && !existingItem.category && (!existingItem.amount || existingItem.amount === 0)) {
          removeExpense(existingItem.id);
        } else {
          updateExpense(existingItem.id, { date: value });
        }
      } else if (field === 'description') {
        if (value.trim() === '' && !existingItem.date && !existingItem.category && (!existingItem.amount || existingItem.amount === 0)) {
          removeExpense(existingItem.id);
        } else {
          updateExpense(existingItem.id, { description: value });
        }
      } else if (field === 'category') {
        if (!value && !existingItem.date && !existingItem.description.trim() && (!existingItem.amount || existingItem.amount === 0)) {
          removeExpense(existingItem.id);
        } else {
          updateExpense(existingItem.id, { category: value });
        }
      } else {
        const numValue = parseFloat(value) || 0;
        if (numValue === 0 && !existingItem.date && !existingItem.description.trim() && !existingItem.category) {
          removeExpense(existingItem.id);
        } else {
          updateExpense(existingItem.id, { amount: numValue });
        }
      }
    } else {
      // Create new item
      if (field === 'date' && value) {
        addExpense({ date: value, description: '', category: '', amount: 0 });
      } else if (field === 'description' && value.trim()) {
        addExpense({ date: '', description: value, category: '', amount: 0 });
      } else if (field === 'category' && value) {
        addExpense({ date: '', description: '', category: value, amount: 0 });
      } else if (field === 'amount' && value) {
        const numValue = parseFloat(value) || 0;
        if (numValue > 0) {
          addExpense({ date: '', description: '', category: '', amount: numValue });
        }
      }
    }
  };

  const handleClearAll = () => {
    if (expenses.length === 0) return;
    setConfirmOpen(true);
  };

  const handleConfirmClearAll = () => {
    expenses.forEach((item) => removeExpense(item.id));
    setConfirmOpen(false);
  };

  const renderRow = (index: number) => {
    const item = expenses[index];
    
    return (
      <tr key={index} className="table-row">
        <td className="py-2 px-3 border-r border-ink-100/70">
          <input
            type="date"
            value={item?.date || ''}
            onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
            onChange={(e) => handleCellChange(index, 'date', e.target.value)}
            className="input-ghost [&::-webkit-calendar-picker-indicator]:hidden [&:not(:focus):invalid]:text-transparent"
          />
        </td>
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
        <td className="py-2 px-3 border-r border-ink-100/70">
          <select
            value={item?.category || ''}
            onChange={(e) => handleCellChange(index, 'category', e.target.value)}
            className="input-ghost min-w-[12rem]"
          >
            <option value="">{t(language, 'select')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </td>
        <td className="py-2 px-3 text-center">
          {item ? (
            <button
              onClick={() => removeExpense(item.id)}
              className="text-amber-600 hover:text-amber-700 font-medium p-1 transition-transform duration-200 hover:scale-110 active:scale-95"
              title={t(language, 'clearRow')}
            >
              <svg className="w-5 h-5 transition-transform duration-200 hover:-rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H8m0 0l3.5-3.5M8 12l3.5 3.5M4 20h10a2 2 0 002-2v-2" />
              </svg>
            </button>
          ) : null}
        </td>
      </tr>
    );
  };

  return (
    <section className="card card-pad mb-6 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title font-heading">{t(language, 'expenseTracker')}</h2>
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
            title={t(language, 'confirmClearExpenses')}
          >
            {t(language, 'clearAll')}
          </button>
          <div className="rounded-full border border-ink-200/70 bg-white px-4 py-2 dark:bg-ink-900/70 dark:border-ink-700/70">
            <span className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-300">{t(language, 'total')}</span>
            <span className="ml-2 text-sm font-bold text-ink-900 dark:text-white">{formatCurrency(totalExpenses)}</span>
          </div>
          <ConfirmToast
            open={confirmOpen}
            message={t(language, 'confirmClearExpenses')}
            subtext={t(language, 'confirmSubtext')}
            confirmLabel={t(language, 'clearAll')}
            cancelLabel={t(language, 'cancel')}
            positionClassName="absolute right-0 top-full mt-2 z-50"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmClearAll}
          />
        </div>
      </div>

      <div className="table-shell flex-1">
        <table className="w-full">
          <thead className="sticky top-0 table-head">
            <tr className="border-b border-ink-100/80">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-32 border-r border-ink-100/70">{t(language, 'date')}</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">{t(language, 'description')}</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-40 border-r border-ink-100/70">{t(language, 'amount')}</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-56 border-r border-ink-100/70">{t(language, 'category')}</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-16">{t(language, 'action')}</th>
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
