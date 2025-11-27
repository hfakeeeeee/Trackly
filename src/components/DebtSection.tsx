import React from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { DebtItem } from '../types';
import { formatCurrency } from '../utils/helpers';

interface DebtSectionProps {
  debts: DebtItem[];
  updateDebts: (debts: DebtItem[]) => void;
  currency: string;
}

export const DebtSection: React.FC<DebtSectionProps> = ({ debts, updateDebts, currency }) => {
  const addItem = () => {
    updateDebts([...debts, { id: Date.now().toString(), description: 'New Debt', dueDate: '', budget: 0, paid: 0 }]);
  };

  const updateItem = (id: string, field: keyof DebtItem, value: any) => {
    updateDebts(debts.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const total = { budget: debts.reduce((s, i) => s + i.budget, 0), paid: debts.reduce((s, i) => s + i.paid, 0) };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-in bg-gradient-to-br from-orange-50/50 to-rose-50/50">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="text-orange-500" size={20} />
        <h3 className="text-lg font-bold text-gray-700 tracking-wide">DEBT</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-white/40">
              <th className="text-left py-2 font-bold text-gray-700">Description</th>
              <th className="text-left py-2 font-bold text-gray-700">Due Date</th>
              <th className="text-right py-2 font-bold text-gray-700">Budget</th>
              <th className="text-right py-2 font-bold text-gray-700">Paid</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {debts.map(item => (
              <tr key={item.id} className="border-b border-white/20 hover:bg-white/10">
                <td className="py-2"><input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded" /></td>
                <td className="py-2"><input type="date" value={item.dueDate} onChange={(e) => updateItem(item.id, 'dueDate', e.target.value)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded" /></td>
                <td className="py-2 text-right"><input type="number" value={item.budget} onChange={(e) => updateItem(item.id, 'budget', parseFloat(e.target.value) || 0)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right" /></td>
                <td className="py-2 text-right"><input type="number" value={item.paid} onChange={(e) => updateItem(item.id, 'paid', parseFloat(e.target.value) || 0)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right" /></td>
                <td className="py-2"><button onClick={() => updateDebts(debts.filter(d => d.id !== item.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4 glass-strong p-3 rounded-lg">
        <span className="font-bold">Totals</span>
        <div className="flex gap-6"><span className="font-bold gradient-text">{formatCurrency(total.budget, currency)}</span><span className="font-bold gradient-text">{formatCurrency(total.paid, currency)}</span><span className="w-10"></span></div>
      </div>
      <button onClick={addItem} className="w-full mt-4 glass glass-hover rounded-lg py-3 flex items-center justify-center gap-2 text-gray-700 font-semibold border-2 border-dashed border-white/40"><Plus size={20} />Add Debt</button>
    </div>
  );
};
