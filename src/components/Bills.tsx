import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const Bills: React.FC = () => {
  const { bills, addBill, removeBill, updateBill } = useApp();
  const [maxRows, setMaxRows] = useState(20);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalBills = bills.reduce((sum, item) => sum + item.amount, 0);

  const handleCellChange = (index: number, field: 'description' | 'amount' | 'date', value: string) => {
    const existingItem = bills[index];
    
    if (existingItem) {
      // Update existing item
      if (field === 'description') {
        if (value.trim() === '' && (!existingItem.amount || existingItem.amount === 0) && !existingItem.date) {
          removeBill(existingItem.id);
        } else {
          updateBill(existingItem.id, { description: value });
        }
      } else if (field === 'amount') {
        const numValue = parseFloat(value) || 0;
        if (numValue === 0 && !existingItem.description.trim() && !existingItem.date) {
          removeBill(existingItem.id);
        } else {
          updateBill(existingItem.id, { amount: numValue });
        }
      } else {
        if (!value && !existingItem.description.trim() && (!existingItem.amount || existingItem.amount === 0)) {
          removeBill(existingItem.id);
        } else {
          updateBill(existingItem.id, { date: value });
        }
      }
    } else {
      // Create new item
      if (field === 'description' && value.trim()) {
        addBill({ description: value, amount: 0, date: '' });
      } else if (field === 'amount' && value) {
        const numValue = parseFloat(value) || 0;
        if (numValue > 0) {
          addBill({ description: '', amount: numValue, date: '' });
        }
      } else if (field === 'date' && value) {
        addBill({ description: '', amount: 0, date: value });
      }
    }
  };

  const renderRow = (index: number) => {
    const item = bills[index];
    
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
            type="date"
            value={item?.date || ''}
            onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
            onChange={(e) => handleCellChange(index, 'date', e.target.value)}
            className="input-ghost [&::-webkit-calendar-picker-indicator]:hidden [&:not(:focus):invalid]:text-transparent"
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
    <section className="card card-pad mb-6 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title font-heading">Bills</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMaxRows(maxRows + 1)}
            className="btn-ghost group transition-transform duration-200 hover:scale-105 active:scale-95"
            title="Add 1 more row"
          >
            <svg className="w-5 h-5 animate-pop-in transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="rounded-full border border-amber-200/60 bg-amber-50/70 px-4 py-2">
            <span className="text-xs uppercase tracking-wide text-ink-500">Total</span>
            <span className="ml-2 text-sm font-semibold text-amber-700">{formatCurrency(totalBills)}</span>
          </div>
        </div>
      </div>

      <div className="table-shell flex-1">
        <table className="w-full">
          <thead className="sticky top-0 table-head">
            <tr className="border-b border-ink-100/80">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">Description</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-32 border-r border-ink-100/70">Due Date</th>
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
