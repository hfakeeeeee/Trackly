import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { SavingsItem } from '../types';

export const Savings: React.FC = () => {
  const { savings, addSavings, removeSavings, updateSavings, getTotalSavings } = useApp();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && amount) {
      addSavings({
        description,
        amount: parseFloat(amount),
      });
      setDescription('');
      setAmount('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleEdit = (item: SavingsItem) => {
    setEditingId(item.id);
    setEditDescription(item.description);
    setEditAmount(item.amount.toString());
  };

  const handleUpdate = (id: string) => {
    if (editDescription && editAmount) {
      updateSavings(id, {
        description: editDescription,
        amount: parseFloat(editAmount),
      });
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
    setEditAmount('');
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Savings</h2>
        <div className="bg-blue-100 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600">Total: </span>
          <span className="text-lg font-bold text-blue-700">{formatCurrency(getTotalSavings())}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium flex items-center justify-center"
          title="Add Savings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {savings.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No savings entries yet. Start saving today!
                </td>
              </tr>
            ) : (
              savings.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {editingId === item.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="text-green-600 hover:text-green-800 font-medium mr-2 p-1"
                          title="Save"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800 font-medium p-1"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4 text-right font-medium text-blue-600">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-2 p-1"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeSavings(item.id)}
                          className="text-red-600 hover:text-red-800 font-medium p-1"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
