import React from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { ExpenseTrackerItem, EXPENSE_CATEGORIES } from '../types';
import { formatCurrency } from '../utils/helpers';

interface ExpenseTrackerSectionProps {
  expenses: ExpenseTrackerItem[];
  updateExpenses: (expenses: ExpenseTrackerItem[]) => void;
  currency: string;
  categoryBreakdown: { label: string; value: number; percentage: number }[];
}

export const ExpenseTrackerSection: React.FC<ExpenseTrackerSectionProps> = ({ expenses, updateExpenses, currency }) => {
  const addItem = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    updateExpenses([...expenses, { id: Date.now().toString(), date: dateStr, amount: 0, description: 'New Expense', category: 'Other' }]);
  };

  const updateItem = (id: string, field: keyof ExpenseTrackerItem, value: any) => {
    updateExpenses(expenses.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const total = expenses.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="glass rounded-2xl p-6 animate-slide-in bg-gradient-to-br from-rose-100/50 to-purple-100/50">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="text-purple-500" size={20} />
        <h3 className="text-lg font-bold text-gray-700 tracking-wide">EXPENSE TRACKER</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-white/40">
              <th className="text-left py-2 font-bold text-gray-700">Date</th>
              <th className="text-right py-2 font-bold text-gray-700">Amount</th>
              <th className="text-left py-2 font-bold text-gray-700">Description</th>
              <th className="text-left py-2 font-bold text-gray-700">Category</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(item => (
              <tr key={item.id} className="border-b border-white/20 hover:bg-white/10">
                <td className="py-2 font-medium text-gray-600">{item.date}</td>
                <td className="py-2 text-right"><input type="number" value={item.amount} onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right" /></td>
                <td className="py-2"><input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded" /></td>
                <td className="py-2">
                  <select value={item.category} onChange={(e) => updateItem(item.id, 'category', e.target.value)} className="w-full glass px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-purple-400">
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </td>
                <td className="py-2"><button onClick={() => updateExpenses(expenses.filter(e => e.id !== item.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4 glass-strong p-3 rounded-lg">
        <span className="font-bold">Total</span>
        <span className="font-bold gradient-text">{formatCurrency(total, currency)}</span>
      </div>
      <button onClick={addItem} className="w-full mt-4 glass glass-hover rounded-lg py-3 flex items-center justify-center gap-2 text-gray-700 font-semibold border-2 border-dashed border-white/40"><Plus size={20} />Add Expense</button>
    </div>
  );
};
