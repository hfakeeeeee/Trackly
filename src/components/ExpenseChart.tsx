import React from 'react';
import { useApp } from '../AppContext';
import { t } from '../i18n';

export const ExpenseChart: React.FC = () => {
  const { categories, uiSettings } = useApp();
  const { language } = uiSettings;

  const chartData = categories
    .map((cat, index) => ({
      name: cat.name,
      value: cat.total,
      color: `var(--chart-${index % 6 + 1})`,
    })).filter(cat => cat.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section className="card card-pad chart-card">
      <h2 className="section-title font-heading mb-4">{t(language, 'expenseDistribution')}</h2>
      
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center min-h-64 text-ink-500 dark:text-ink-400">
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
        <div className="chart-breakdown category-chart">
          {[...chartData].sort((a, b) => b.value - a.value).map(entry => {
            const total = chartData.reduce((sum, item) => sum + item.value, 0);
            const percent = entry.value / total * 100;
            const color = entry.color;
            return <div className="chart-breakdown-row" key={entry.name}>
              <div className="chart-breakdown-label"><span className="chart-dot" style={{ background: color }} /><span className="break-words min-w-0">{entry.name}</span></div>
              <div className="chart-breakdown-value"><span>{formatCurrency(entry.value)}</span><small>{percent.toFixed(1)}%</small></div>
              <div className="chart-track"><span style={{ width: `${percent}%`, background: color }} /></div>
            </div>;
          })}
        </div>
      )}
    </section>
  );
};
