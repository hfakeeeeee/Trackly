import React from 'react';
import { useApp } from '../AppContext';
import { differenceInDays, format } from 'date-fns';

export const Overview: React.FC = () => {
  const { periodSettings, updatePeriod, getRemainingAmount } = useApp();

  const today = new Date();
  const endDate = new Date(periodSettings.endDate);
  const daysRemaining = Math.max(0, differenceInDays(endDate, today) + 1);
  const remainingAmount = getRemainingAmount();
  const dailyAllowance = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePeriod(e.target.value, periodSettings.endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePeriod(periodSettings.startDate, e.target.value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="card card-pad mb-6 h-full flex flex-col">
      <h2 className="section-title font-heading mb-4">Overview</h2>
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Start Date</label>
          <input
            type="date"
            value={periodSettings.startDate}
            onChange={handleStartDateChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">End Date</label>
          <input
            type="date"
            value={periodSettings.endDate}
            onChange={handleEndDateChange}
            className="input"
          />
        </div>
        <div className="rounded-xl border border-ink-100/70 bg-sand-50/70 p-4">
          <p className="text-xs uppercase tracking-wide text-ink-500 mb-1">Days Remaining</p>
          <p className="text-3xl font-semibold text-ink-900">{daysRemaining}</p>
        </div>
        <div className="rounded-xl border border-teal-200/60 bg-teal-50/60 p-4">
          <p className="text-xs uppercase tracking-wide text-ink-500 mb-1">Daily Allowance</p>
          <p className={`text-2xl font-semibold ${dailyAllowance < 0 ? 'text-rose-600' : 'text-teal-700'}`}>
            {formatCurrency(dailyAllowance)}
          </p>
        </div>
      </div>
    </section>
  );
};
