import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { BillItem } from '../types';
import { formatCurrency } from '../utils/helpers';

interface BillsSectionProps {
  bills: BillItem[];
  updateBills: (bills: BillItem[]) => void;
  currency: string;
}

export const BillsSection: React.FC<BillsSectionProps> = ({ bills, updateBills, currency }) => {
  const addItem = () => {
    updateBills([...bills, { id: Date.now().toString(), checked: false, description: 'New Bill', dueDate: '', amount: 0 }]);
  };

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    updateBills(bills.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const totalAmount = bills.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="glass rounded-2xl p-6 animate-slideUp">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="text-purple-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">BILLS</h2>
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
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="w-12 px-3"></th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Description</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700 w-40">Due Date</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700 w-32">Amount</th>
              <th className="w-12 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {bills.map(item => (
              <tr key={item.id} className="border-b border-gray-300 hover:bg-white/5 transition-colors">
                <td className="py-3 px-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => updateItem(item.id, 'checked', e.target.checked)}
                    className="w-5 h-5 rounded cursor-pointer accent-purple-600"
                  />
                </td>
                <td className="py-3 px-3 w-1/3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-white/40 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) => updateItem(item.id, 'dueDate', e.target.value)}
                    className="w-full bg-white/40 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/40 border border-gray-300 rounded-lg px-2 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => updateBills(bills.filter(b => b.id !== item.id))}
                    className="text-red-300 hover:text-red-200 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-6 glass-strong p-4 rounded-xl">
        <span className="font-bold text-gray-800 text-lg">Total</span>
        <span className="font-bold text-purple-600 text-xl">{formatCurrency(totalAmount, currency)}</span>
      </div>
    </div>
  );
};
