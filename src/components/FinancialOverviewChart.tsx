import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useApp } from '../AppContext';
import { t } from '../i18n';


export const FinancialOverviewChart: React.FC = () => {
  const { debts, bills, savings, expenses, uiSettings } = useApp();
  const { language } = uiSettings;

  const totalDebt = debts.reduce((sum, item) => sum + item.amount, 0);
  const totalBills = bills.reduce((sum, item) => sum + item.amount, 0);
  const totalSavings = savings.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  const chartData = [
    { name: t(language, 'debt'), value: totalDebt, color: '#ef4444' },
    { name: t(language, 'bills'), value: totalBills, color: '#f59e0b' },
    { name: t(language, 'savings'), value: totalSavings, color: '#10b981' },
    { name: t(language, 'expense'), value: totalExpenses, color: '#8b5cf6' },
  ].filter((item) => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-ink-100/70 bg-white/90 px-4 py-2 text-sm shadow-soft dark:border-ink-800/70 dark:bg-ink-900/80">
          <p className="font-semibold text-ink-900 dark:text-ink-100">{payload[0].name}</p>
          <p className="text-teal-700 font-semibold dark:text-teal-300">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="card card-pad mb-6 h-full flex flex-col">
      <h2 className="section-title font-heading mb-4">{t(language, 'financialOverview')}</h2>
      
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-ink-500 dark:text-ink-400">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-ink-400 dark:text-ink-500 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">{t(language, 'noFinancialDataTitle')}</p>
            <p className="text-sm mt-1">{t(language, 'noFinancialDataBody')}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {totalDebt > 0 && (
              <div className="rounded-xl border border-rose-200/60 bg-rose-50/70 p-2 dark:border-rose-500/30 dark:bg-rose-500/10">
                <p className="text-xs text-ink-500 dark:text-ink-300">{t(language, 'debt')}</p>
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(totalDebt)}</p>
              </div>
            )}
            {totalBills > 0 && (
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-2 dark:border-amber-500/30 dark:bg-amber-500/10">
                <p className="text-xs text-ink-500 dark:text-ink-300">{t(language, 'bills')}</p>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{formatCurrency(totalBills)}</p>
              </div>
            )}
            {totalSavings > 0 && (
              <div className="rounded-xl border border-teal-200/60 bg-teal-50/70 p-2 dark:border-teal-500/30 dark:bg-teal-500/10">
                <p className="text-xs text-ink-500 dark:text-ink-300">{t(language, 'savings')}</p>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{formatCurrency(totalSavings)}</p>
              </div>
            )}
            {totalExpenses > 0 && (
              <div className="rounded-xl border border-ink-200/60 bg-ink-50/70 p-2 dark:border-ink-700/70 dark:bg-ink-900/70">
                <p className="text-xs text-ink-500 dark:text-ink-300">{t(language, 'expense')}</p>
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{formatCurrency(totalExpenses)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
