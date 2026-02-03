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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <header className="relative overflow-hidden bg-ink-900 text-white shadow-float">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-60 w-60 rounded-full bg-teal-500/30 blur-3xl animate-slow-float animate-pulse-glow" />
        <div className="absolute -top-16 right-12 h-72 w-72 rounded-full bg-amber-400/30 blur-3xl animate-slow-float animate-pulse-glow" />
        <div className="absolute -left-1/3 top-10 h-12 w-2/3 rotate-2 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-xl animate-shimmer" />
        <div className="absolute -bottom-20 left-1/3 h-40 w-2/3 rounded-full bg-gradient-to-r from-teal-500/20 via-amber-400/20 to-rose-400/20 blur-2xl animate-aurora" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ink-900/70 to-transparent" />
      </div>
      <div className="relative px-6 py-10 sm:px-10 animate-fade-in">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="pill inline-block bg-white/15 text-white">Monthly Snapshot</p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {currentMonth}
            </h1>
          </div>
          <div className="text-sm text-white/70">
            Trackly keeps your month on course.
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="stat-card">
            <p className="text-xs uppercase tracking-wide text-white/70">Total Income</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs uppercase tracking-wide text-white/70">Total Savings</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalSavings)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs uppercase tracking-wide text-white/70">Total Money Spent</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs uppercase tracking-wide text-white/70">Remaining Amount</p>
            <p className={`mt-2 text-2xl font-semibold ${remainingAmount < 0 ? 'text-rose-200' : 'text-white'}`}>
              {formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
