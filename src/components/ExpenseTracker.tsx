import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const ExpenseTracker: React.FC = () => {
  const { expenses, categories, addExpense, removeExpense } = useApp();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && amount && description && category) {
      addExpense({
        date,
        amount: parseFloat(amount),
        description,
        category,
      });
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Expense Tracker</h2>
        <div className="bg-purple-100 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600">Total: </span>
          <span className="text-lg font-bold text-purple-700">{formatCurrency(totalExpenses)}</span>
        </div>
      </div>

      {/* Expense Form */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium"
        >
          Add Expense
        </button>
      </form>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No expenses recorded yet. Start tracking your spending!
                </td>
              </tr>
            ) : (
              [...expenses].reverse().map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4">
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-purple-600">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => removeExpense(item.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
