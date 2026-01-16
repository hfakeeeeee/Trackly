import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          {showAddCategory ? 'Cancel' : '+ Add Category'}
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
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium"
          >
            Add
          </button>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-gray-50 p-4 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-800 text-lg">{cat.name}</p>
              <p className="text-sm text-gray-500 mt-1">Total spent in this category</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(cat.total)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
