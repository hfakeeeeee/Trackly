import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const Income: React.FC = () => {
  const { income, addIncome, removeIncome, updateIncome, getTotalIncome } = useApp();
  const [maxRows, setMaxRows] = useState(5);

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
            placeholder="Enter description"
          />
        </td>
        <td className="py-2 px-3">
          <input
            type="number"
            step="1"
            value={item?.amount || ''}
            onChange={(e) => handleCellChange(index, 'amount', e.target.value)}
            className="input-ghost text-right tabular-nums"
            placeholder="0"
          />
        </td>
      </tr>
    );
  };

  return (
    <section className="card card-pad mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title font-heading">Income</h2>
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
          <div className="rounded-full border border-teal-200/60 bg-teal-50/70 px-4 py-2">
            <span className="text-xs uppercase tracking-wide text-ink-500">Total</span>
            <span className="ml-2 text-sm font-semibold text-teal-700">{formatCurrency(getTotalIncome())}</span>
          </div>
        </div>
      </div>

      <div className="table-shell">
        <table className="w-full">
          <thead className="table-head">
            <tr className="border-b border-ink-100/80">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">Description</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-40">Amount</th>
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
