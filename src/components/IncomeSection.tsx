import React from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { IncomeItem } from '../types';
import { formatCurrency } from '../utils/helpers';

interface IncomeSectionProps {
  income: IncomeItem[];
  updateIncome: (income: IncomeItem[]) => void;
  currency: string;
}

export const IncomeSection: React.FC<IncomeSectionProps> = ({ income, updateIncome, currency }) => {
  const addItem = () => {
    const newItem: IncomeItem = {
      id: Date.now().toString(),
      description: 'New Income',
      expected: 0,
      amount: 0
    };
    updateIncome([...income, newItem]);
  };

  const deleteItem = (id: string) => {
    updateIncome(income.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof IncomeItem, value: any) => {
    updateIncome(income.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalExpected = income.reduce((sum, item) => sum + item.expected, 0);
  const totalAmount = income.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="glass rounded-2xl p-6 animate-slide-in bg-gradient-to-br from-cyan-50/50 to-teal-50/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="text-teal-500" size={20} />
          <h3 className="text-lg font-bold text-gray-700 tracking-wide">INCOME</h3>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-white/40">
              <th className="text-left py-2 font-bold text-gray-700">Description</th>
              <th className="text-right py-2 font-bold text-gray-700">Expected</th>
              <th className="text-right py-2 font-bold text-gray-700">Amount</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {income.map(item => (
              <tr key={item.id} className="border-b border-white/20 hover:bg-white/10">
                <td className="py-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded"
                  />
                </td>
                <td className="py-2 text-right">
                  <input
                    type="number"
                    value={item.expected}
                    onChange={(e) => updateItem(item.id, 'expected', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right"
                  />
                </td>
                <td className="py-2 text-right">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right"
                  />
                </td>
                <td className="py-2 text-center">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 glass-strong p-3 rounded-lg">
        <span className="font-bold text-gray-800">Totals</span>
        <div className="flex gap-6">
          <span className="font-bold gradient-text">{formatCurrency(totalExpected, currency)}</span>
          <span className="font-bold gradient-text">{formatCurrency(totalAmount, currency)}</span>
          <span className="w-10"></span>
        </div>
      </div>

      <button
        onClick={addItem}
        className="w-full mt-4 glass glass-hover rounded-lg py-3 flex items-center justify-center gap-2 text-gray-700 font-semibold border-2 border-dashed border-white/40"
      >
        <Plus size={20} />
        Add Income
      </button>
    </div>
  );
};
