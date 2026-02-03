import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const ExpenseTracker: React.FC = () => {
  const { expenses, categories, addExpense, removeExpense, updateExpense } = useApp();
  const [maxRows, setMaxRows] = useState(50);

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
            placeholder="Enter description"
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
        <td className="py-2 px-3">
          <select
            value={item?.category || ''}
            onChange={(e) => handleCellChange(index, 'category', e.target.value)}
            className="input-ghost min-w-[12rem]"
          >
            <option value="">Select</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </td>
      </tr>
    );
  };

  return (
    <section className="card card-pad mb-6 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title font-heading">Expense Tracker</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMaxRows(maxRows + 1)}
            className="btn-ghost"
            title="Add 1 more row"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="rounded-full border border-ink-200/70 bg-ink-50/70 px-4 py-2">
            <span className="text-xs uppercase tracking-wide text-ink-500">Total</span>
            <span className="ml-2 text-sm font-semibold text-ink-800">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </div>

      <div className="table-shell flex-1">
        <table className="w-full">
          <thead className="sticky top-0 table-head">
            <tr className="border-b border-ink-100/80">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-32 border-r border-ink-100/70">Date</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">Description</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-40 border-r border-ink-100/70">Amount</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-56">Category</th>
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
