import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { BillItem } from '../types';

interface BillsSectionProps {
  bills: BillItem[];
  updateBills: (bills: BillItem[]) => void;
  currency: string;
}

export const BillsSection: React.FC<BillsSectionProps> = ({ bills, updateBills }) => {
  const addItem = () => {
    updateBills([...bills, { id: Date.now().toString(), checked: false, description: 'New Bill', dueDate: '', budget: 0, actual: 0 }]);
  };

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    updateBills(bills.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-in bg-gradient-to-br from-rose-100/50 to-pink-100/50">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="text-rose-500" size={20} />
        <h3 className="text-lg font-bold text-gray-700 tracking-wide">BILLS</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-white/40">
              <th className="w-10"></th>
              <th className="text-left py-2 font-bold text-gray-700">Description</th>
              <th className="text-left py-2 font-bold text-gray-700">Due Date</th>
              <th className="text-right py-2 font-bold text-gray-700">Budget</th>
              <th className="text-right py-2 font-bold text-gray-700">Actual</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {bills.map(item => (
              <tr key={item.id} className="border-b border-white/20 hover:bg-white/10">
                <td className="py-2"><input type="checkbox" checked={item.checked} onChange={(e) => updateItem(item.id, 'checked', e.target.checked)} className="cursor-pointer" /></td>
                <td className="py-2"><input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded" /></td>
                <td className="py-2"><input type="date" value={item.dueDate} onChange={(e) => updateItem(item.id, 'dueDate', e.target.value)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded" /></td>
                <td className="py-2 text-right"><input type="number" value={item.budget} onChange={(e) => updateItem(item.id, 'budget', parseFloat(e.target.value) || 0)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right" /></td>
                <td className="py-2 text-right"><input type="number" value={item.actual} onChange={(e) => updateItem(item.id, 'actual', parseFloat(e.target.value) || 0)} className="w-full bg-transparent focus:outline-none focus:bg-white/20 px-2 py-1 rounded text-right" /></td>
                <td className="py-2"><button onClick={() => updateBills(bills.filter(b => b.id !== item.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addItem} className="w-full mt-4 glass glass-hover rounded-lg py-3 flex items-center justify-center gap-2 text-gray-700 font-semibold border-2 border-dashed border-white/40"><Plus size={20} />Add Bill</button>
    </div>
  );
};
