import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useApp } from '../AppContext';
import { t } from '../i18n';

const COLORS = [
  '#14b8a6', // teal
  '#f97316', // amber
  '#f43f5e', // rose
  '#7c3aed', // violet
  '#22c55e', // green
  '#0ea5e9', // sky
  '#facc15', // gold
  '#64748b', // slate
];

export const ExpenseChart: React.FC = () => {
  const { categories, uiSettings } = useApp();
  const { language } = uiSettings;

  const chartData = categories
    .filter((cat) => cat.total > 0)
    .map((cat) => ({
      name: cat.name,
      value: cat.total,
    }));

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
    <section className="card card-pad mb-6">
      <h2 className="section-title font-heading mb-4">{t(language, 'expenseDistribution')}</h2>
      
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-ink-500 dark:text-ink-400">
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
            <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">{t(language, 'noExpenseDataTitle')}</p>
            <p className="text-sm mt-1">{t(language, 'noExpenseDataBody')}</p>
          </div>
        </div>
      ) : (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
