import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ConfirmToast } from './ConfirmToast';

export const Savings: React.FC = () => {
  const { savings, addSavings, removeSavings, updateSavings, getTotalSavings } = useApp();
  const [maxRows, setMaxRows] = useState(5);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCellChange = (index: number, field: 'description' | 'amount', value: string) => {
    const existingItem = savings[index];
    
    if (existingItem) {
      // Update existing item
      if (field === 'description') {
        if (value.trim() === '' && (!existingItem.amount || existingItem.amount === 0)) {
          removeSavings(existingItem.id);
        } else {
          updateSavings(existingItem.id, { description: value });
        }
      } else {
        const numValue = parseFloat(value) || 0;
        if (numValue === 0 && !existingItem.description.trim()) {
          removeSavings(existingItem.id);
        } else {
          updateSavings(existingItem.id, { amount: numValue });
        }
      }
    } else {
      // Create new item
      if (field === 'description' && value.trim()) {
        addSavings({ description: value, amount: 0 });
      } else if (field === 'amount' && value) {
        const numValue = parseFloat(value) || 0;
        if (numValue > 0) {
          addSavings({ description: '', amount: numValue });
        }
      }
    }
  };

  const handleClearAll = () => {
    if (savings.length === 0) return;
    setConfirmOpen(true);
  };

  const handleConfirmClearAll = () => {
    savings.forEach((item) => removeSavings(item.id));
    setConfirmOpen(false);
  };

  const renderRow = (index: number) => {
    const item = savings[index];
    
    return (
      <tr key={index} className="table-row">
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
        <td className="py-2 px-3 text-center">
          {item ? (
            <button
              onClick={() => removeSavings(item.id)}
              className="text-amber-600 hover:text-amber-700 font-medium p-1 transition-transform duration-200 hover:scale-110 active:scale-95"
              title="Clear row"
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
    <section className="card card-pad mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title font-heading">Savings</h2>
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => setMaxRows(maxRows + 1)}
            className="btn-ghost group transition-transform duration-200 hover:scale-105 active:scale-95"
            title="Add 1 more row"
          >
            <svg className="w-5 h-5 animate-pop-in transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleClearAll}
            className="btn-ghost text-rose-600 hover:text-rose-700"
            title="Clear all savings rows"
          >
            Clear All
          </button>
          <div className="rounded-full border border-teal-200/60 bg-teal-50/70 px-4 py-2">
            <span className="text-xs uppercase tracking-wide text-ink-500">Total</span>
            <span className="ml-2 text-sm font-semibold text-teal-700">{formatCurrency(getTotalSavings())}</span>
          </div>
          <ConfirmToast
            open={confirmOpen}
            message="Clear all savings rows?"
            confirmLabel="Clear All"
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
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">Description</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-40 border-r border-ink-100/70">Amount</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-16">Action</th>
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
