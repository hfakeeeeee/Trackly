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
    <section className="bg-white rounded-lg shadow-md p-6 mb-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={periodSettings.startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={periodSettings.endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
          <p className="text-3xl font-bold text-primary-700">{daysRemaining}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Daily Allowance</p>
          <p className={`text-2xl font-bold ${dailyAllowance < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(dailyAllowance)}
          </p>
        </div>
      </div>
    </section>
  );
};
