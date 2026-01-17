import React from 'react';
import { useApp } from '../AppContext';

export const Bills: React.FC = () => {
  const { bills, addBill, removeBill, updateBill } = useApp();
  const MAX_ROWS = 20;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalBills = bills.reduce((sum, item) => sum + item.amount, 0);

  const handleCellChange = (index: number, field: 'description' | 'amount' | 'date', value: string) => {
    const existingItem = bills[index];
    
    if (existingItem) {
      // Update existing item
      if (field === 'description') {
        if (value.trim() === '' && (!existingItem.amount || existingItem.amount === 0) && !existingItem.date) {
          removeBill(existingItem.id);
        } else {
          updateBill(existingItem.id, { description: value });
        }
      } else if (field === 'amount') {
        const numValue = parseFloat(value) || 0;
        if (numValue === 0 && !existingItem.description.trim() && !existingItem.date) {
          removeBill(existingItem.id);
        } else {
          updateBill(existingItem.id, { amount: numValue });
        }
      } else {
        if (!value && !existingItem.description.trim() && (!existingItem.amount || existingItem.amount === 0)) {
          removeBill(existingItem.id);
        } else {
          updateBill(existingItem.id, { date: value });
        }
      }
    } else {
      // Create new item
      if (field === 'description' && value.trim()) {
        addBill({ description: value, amount: 0, date: '' });
      } else if (field === 'amount' && value) {
        const numValue = parseFloat(value) || 0;
        if (numValue > 0) {
          addBill({ description: '', amount: numValue, date: '' });
        }
      } else if (field === 'date' && value) {
        addBill({ description: '', amount: 0, date: value });
      }
    }
  };

  const renderRow = (index: number) => {
    const item = bills[index];
    
    return (
      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-2 px-2 border-r border-gray-200">
          <input
            type="text"
            value={item?.description || ''}
            onChange={(e) => handleCellChange(index, 'description', e.target.value)}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded bg-transparent"
            placeholder="Enter description"
          />
        </td>
        <td className="py-2 px-2 border-r border-gray-200">
          <input
            type="date"
            value={item?.date || ''}
            onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
            onChange={(e) => handleCellChange(index, 'date', e.target.value)}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded bg-transparent [&::-webkit-calendar-picker-indicator]:hidden [&:not(:focus):invalid]:text-transparent"
          />
        </td>
        <td className="py-2 px-2">
          <input
            type="number"
            step="1"
            value={item?.amount || ''}
            onChange={(e) => handleCellChange(index, 'amount', e.target.value)}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded text-right bg-transparent"
            placeholder="0"
          />
        </td>
      </tr>
    );
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Bills</h2>
        <div className="bg-orange-100 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600">Total: </span>
          <span className="text-lg font-bold text-orange-700">{formatCurrency(totalBills)}</span>
        </div>
      </div>

      <div className="overflow-auto flex-1 border border-gray-300 rounded">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 font-semibold text-gray-700 border-r border-gray-200">Description</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700 w-32 border-r border-gray-200">Due Date</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700 w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: MAX_ROWS }, (_, index) => renderRow(index))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
