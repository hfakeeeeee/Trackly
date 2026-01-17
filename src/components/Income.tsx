import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { IncomeItem } from '../types';

export const Income: React.FC = () => {
  const { income, addIncome, removeIncome, updateIncome, getTotalIncome } = useApp();
  const MAX_ROWS = 5;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCellChange = (index: number, field: 'description' | 'amount', value: string) => {
    const existingItem = income[index];
    
    if (existingItem) {
      // Update existing item
      if (field === 'description') {
        if (value.trim() === '' && (!existingItem.amount || existingItem.amount === 0)) {
          removeIncome(existingItem.id);
        } else {
          updateIncome(existingItem.id, { description: value });
        }
      } else {
        const numValue = parseFloat(value) || 0;
        if (numValue === 0 && !existingItem.description.trim()) {
          removeIncome(existingItem.id);
        } else {
          updateIncome(existingItem.id, { amount: numValue });
        }
      }
    } else {
      // Create new item
      if (field === 'description' && value.trim()) {
        addIncome({ description: value, amount: 0 });
      } else if (field === 'amount' && value) {
        const numValue = parseFloat(value) || 0;
        if (numValue > 0) {
          addIncome({ description: '', amount: numValue });
        }
      }
    }
  };

  const renderRow = (index: number) => {
    const item = income[index];
    
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
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Income</h2>
        <div className="bg-green-100 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600">Total: </span>
          <span className="text-lg font-bold text-green-700">{formatCurrency(getTotalIncome())}</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 font-semibold text-gray-700 border-r border-gray-200">Description</th>
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
