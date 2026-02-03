import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ConfirmToast } from './ConfirmToast';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, removeCategory } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const MIN_ROWS = 50;

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNameChange = (id: string, name: string) => {
    if (name.trim()) {
      updateCategory(id, name.trim());
    }
  };

  const handleClearAll = () => {
    if (categories.length === 0) return;
    setConfirmOpen(true);
  };

  const handleConfirmClearAll = () => {
    categories.forEach((cat) => removeCategory(cat.id));
    setConfirmOpen(false);
  };

  return (
    <section className="card card-pad mb-6 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title font-heading">Categories</h2>
        <div className="relative flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="btn-ghost text-rose-600 hover:text-rose-700"
            title="Clear all category rows"
          >
            Clear All
          </button>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className={`${showAddCategory ? 'btn-ghost' : 'btn-primary'} group transition-transform duration-200 hover:scale-105 active:scale-95`}
            title={showAddCategory ? 'Cancel' : 'Add Category'}
          >
            {showAddCategory ? (
              <svg className="w-5 h-5 animate-pop-in transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 animate-pop-in transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
          <ConfirmToast
            open={confirmOpen}
            message="Clear all category rows?"
            confirmLabel="Clear All"
            positionClassName="absolute right-0 top-full mt-2 z-50"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmClearAll}
          />
        </div>
      </div>

      {showAddCategory && (
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            className="input"
          />
          <button
            onClick={handleAddCategory}
            className="btn-primary group transition-transform duration-200 hover:scale-105 active:scale-95"
            title="Add"
          >
            <svg className="w-5 h-5 animate-pop-in transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      <div className="table-shell flex-1">
        <table className="w-full">
          <thead className="sticky top-0 table-head">
            <tr className="border-b border-ink-100/80">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">Expense</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-40 border-r border-ink-100/70">Amount</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-24 border-r border-ink-100/70">Percentage</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500 w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const totalExpenses = categories.reduce((sum, c) => sum + c.total, 0);
              const percentage = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : '0.0';
              
              return (
                <tr key={cat.id} className="table-row">
                  <td className="py-2 px-3 border-r border-ink-100/70">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleNameChange(cat.id, e.target.value)}
                      className="input-ghost font-medium"
                    />
                  </td>
                  <td className="py-2 px-3 text-right border-r border-ink-100/70">
                    <span className="font-semibold text-teal-700">{formatCurrency(cat.total)}</span>
                  </td>
                  <td className="py-2 px-3 text-right border-r border-ink-100/70">
                    <span className="font-semibold text-ink-700">{percentage}%</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => removeCategory(cat.id)}
                      className="text-amber-600 hover:text-amber-700 font-medium p-1 transition-transform duration-200 hover:scale-110 active:scale-95"
                      title="Clear row"
                    >
                      <svg className="w-5 h-5 transition-transform duration-200 hover:-rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H8m0 0l3.5-3.5M8 12l3.5 3.5M4 20h10a2 2 0 002-2v-2" />
                      </svg>
                    </button>
                    </td>
                  </tr>
              );
            })}
            {Array.from({ length: Math.max(0, MIN_ROWS - categories.length) }, (_, index) => (
              <tr key={`empty-${index}`} className="table-row">
                <td className="py-2 px-3 border-r border-ink-100/70">&nbsp;</td>
                <td className="py-2 px-3 border-r border-ink-100/70">&nbsp;</td>
                <td className="py-2 px-3 border-r border-ink-100/70">&nbsp;</td>
                <td className="py-2 px-3">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
