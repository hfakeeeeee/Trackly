import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, removeCategory } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
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

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center"
          title={showAddCategory ? 'Cancel' : 'Add Category'}
        >
          {showAddCategory ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>

      {showAddCategory && (
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleAddCategory}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium flex items-center justify-center"
            title="Add"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      <div className="overflow-auto flex-1 border border-gray-300 rounded">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 font-semibold text-gray-700 border-r border-gray-200">Expense</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700 w-32 border-r border-gray-200">Amount</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700 w-24 border-r border-gray-200">Percentage</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700 w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const totalExpenses = categories.reduce((sum, c) => sum + c.total, 0);
              const percentage = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : '0.0';
              
              return (
                <tr key={cat.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-2 px-2 border-r border-gray-200">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleNameChange(cat.id, e.target.value)}
                      className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 rounded font-medium text-gray-800"
                    />
                  </td>
                  <td className="py-2 px-2 text-right border-r border-gray-200">
                    <span className="font-bold text-purple-600">{formatCurrency(cat.total)}</span>
                  </td>
                  <td className="py-2 px-2 text-right border-r border-gray-200">
                    <span className="font-semibold text-gray-700">{percentage}%</span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => removeCategory(cat.id)}
                      className="text-red-600 hover:text-red-800 font-medium p-1"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
              );
            })}
            {Array.from({ length: Math.max(0, MIN_ROWS - categories.length) }, (_, index) => (
              <tr key={`empty-${index}`} className="border-b border-gray-200">
                <td className="py-2 px-2 border-r border-gray-200">&nbsp;</td>
                <td className="py-2 px-2 border-r border-gray-200">&nbsp;</td>
                <td className="py-2 px-2 border-r border-gray-200">&nbsp;</td>
                <td className="py-2 px-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
