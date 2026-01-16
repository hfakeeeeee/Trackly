import React from 'react';
import { useApp } from '../AppContext';
import { format } from 'date-fns';

export const Header: React.FC = () => {
  const { periodSettings, getTotalIncome, getTotalSavings, getTotalExpenses, getRemainingAmount, debts, bills } = useApp();

  const currentMonth = format(new Date(periodSettings.startDate), 'MMMM yyyy');
  const totalIncome = getTotalIncome();
  const totalSavings = getTotalSavings();
  const totalExpenses = getTotalExpenses();
  const totalDebts = debts.reduce((sum, item) => sum + item.amount, 0);
  const totalBills = bills.reduce((sum, item) => sum + item.amount, 0);
  const totalSpend = totalExpenses + totalDebts + totalBills;
  const remainingAmount = getRemainingAmount();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Trackly - {currentMonth}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Total Income</p>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Total Savings</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Total Money Spent</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Remaining Amount</p>
            <p className={`text-2xl font-bold ${remainingAmount < 0 ? 'text-red-300' : ''}`}>
              {formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
