import React from 'react';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { ExpenseItem } from '../types';
import { formatCurrency } from '../utils/helpers';

interface ExpensesSectionProps {
  expenses: ExpenseItem[];
  updateExpenses: (expenses: ExpenseItem[]) => void;
  currency: string;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ expenses, updateExpenses, currency }) => {
  const addItem = () => {
    updateExpenses([...expenses, { id: Date.now().toString(), category: 'Other', budget: 0, actual: 0 }]);
  };

  const updateItem = (id: string, field: keyof ExpenseItem, value: any) => {
    updateExpenses(expenses.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-in bg-gradient-to-br from-rose-100/50 to-orange-100/50">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="text-rose-500" size={20} />
        <h3 className="text-lg font-bold text-gray-700 tracking-wide">EXPENSES</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-white/40">
              <th className="text-left py-2 font-bold text-gray-700">Category</th>
              <th className="text-right py-2 font-bold text-gray-700">Budget</th>
              <th className="text-right py-2 font-bold text-gray-700">Actual</th>
              <th className="text-right py-2 font-bold text-gray-700">Remaining</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(item => {
              const remaining = item.budget - item.actual;
              return (
                <tr key={item.id} className="border-b border-white/20 hover:bg-white/10">
                  <td className="py-2"><input type="text" value={item.category} onChange={(e) => updateItem(item.id, 'category', e.target.value)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded" /></td>
                  <td className="py-2 text-right"><input type="number" value={item.budget} onChange={(e) => updateItem(item.id, 'budget', parseFloat(e.target.value) || 0)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right" /></td>
                  <td className="py-2 text-right"><input type="number" value={item.actual} onChange={(e) => updateItem(item.id, 'actual', parseFloat(e.target.value) || 0)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right" /></td>
                  <td className={`py-2 text-right font-semibold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatCurrency(remaining, currency)}</td>
                  <td className="py-2"><button onClick={() => updateExpenses(expenses.filter(e => e.id !== item.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={addItem} className="w-full mt-4 glass glass-hover rounded-lg py-3 flex items-center justify-center gap-2 text-gray-700 font-semibold border-2 border-dashed border-white/40"><Plus size={20} />Add Expense</button>
    </div>
  );
};
