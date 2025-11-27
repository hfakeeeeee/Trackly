import React from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { ExpenseTrackerItem, Category } from '../types';
import { formatCurrency } from '../utils/helpers';

interface ExpenseTrackerSectionProps {
  expenses: ExpenseTrackerItem[];
  updateExpenses: (expenses: ExpenseTrackerItem[]) => void;
  categories: Category[];
  currency: string;
}

export const ExpenseTrackerSection: React.FC<ExpenseTrackerSectionProps> = ({ expenses, updateExpenses, categories, currency }) => {
  const addItem = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    updateExpenses([...expenses, { id: Date.now().toString(), date: dateStr, amount: 0, description: 'New Expense', category: categories[0]?.name || 'Other' }]);
  };

  const updateItem = (id: string, field: keyof ExpenseTrackerItem, value: any) => {
    updateExpenses(expenses.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const total = expenses.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="glass rounded-2xl p-6 animate-slideUp">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="text-violet-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">EXPENSE TRACKER</h2>
        </div>
        <button
          onClick={addItem}
          className="glass-hover px-4 py-2 rounded-xl text-gray-800 font-medium flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus size={18} />
          Add
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-3 font-semibold text-gray-700 w-24">Date</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700 w-32">Amount</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Description</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700 w-40">Category</th>
              <th className="w-10 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(item => {
              const category = categories.find(c => c.name === item.category);
              return (
                <tr key={item.id} className="border-b border-gray-300 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 w-24">
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                      className="w-full bg-white/40 border border-gray-300 rounded-lg px-2 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </td>
                  <td className="py-3 px-3 w-32">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-28 bg-white/40 border border-gray-300 rounded-lg px-2 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full bg-white/40 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </td>
                  <td className="py-3 px-3 w-40">
                    <div className="flex items-center gap-2">
                      {category && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                        className="flex-1 min-w-0 bg-white/40 border border-gray-300 rounded-lg px-2 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => updateExpenses(expenses.filter(e => e.id !== item.id))}
                      className="text-red-300 hover:text-red-200 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-6 glass-strong p-4 rounded-xl">
        <span className="font-bold text-gray-800 text-lg">Total</span>
        <span className="font-bold text-violet-600 text-xl">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  );
};
