import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../AppContext';
import { t } from '../i18n';

export const DailyExpenseChart: React.FC = () => {
  const { expenses, uiSettings } = useApp();
  const { language } = uiSettings;

  const chartData = Object.values(
    expenses.reduce<Record<string, { date: string; total: number }>>((acc, item) => {
      if (!item.date || item.amount <= 0) return acc;

      if (!acc[item.date]) {
        acc[item.date] = { date: item.date, total: 0 };
      }

      acc[item.date].total += item.amount;
      return acc;
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatShortDate = (value: string) => {
    const [year, month, day] = value.split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-xl border border-ink-100/70 bg-white/90 px-4 py-2 text-sm shadow-soft dark:border-ink-800/70 dark:bg-ink-900/80">
        <p className="font-semibold text-ink-900 dark:text-ink-100">{label}</p>
        <p className="font-semibold text-sky-700 dark:text-sky-300">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  };

  return (
    <section className="card card-pad">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title font-heading">{t(language, 'dailyExpenseChart')}</h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            {t(language, 'dailyExpenseChartBody')}
          </p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-ink-500 dark:text-ink-400">
          <div className="text-center">
            <svg
              className="mx-auto mb-3 h-12 w-12 text-ink-400 dark:text-ink-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3v18h18M7 14l3-3 3 2 4-5"
              />
            </svg>
            <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">
              {t(language, 'noDailyExpenseDataTitle')}
            </p>
            <p className="mt-1 text-sm">{t(language, 'noDailyExpenseDataBody')}</p>
          </div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
              barCategoryGap="28%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                stroke="#64748b"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(Number(value))}
              />
              <Tooltip
                cursor={{ fill: 'rgba(14, 165, 233, 0.08)' }}
                content={<CustomTooltip />}
                labelFormatter={(value) => String(value)}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0369a1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0369a1', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#0369a1', stroke: '#e0f2fe', strokeWidth: 2 }}
              />
              <Bar
                dataKey="total"
                radius={[10, 10, 0, 0]}
                fill="#0ea5e9"
                barSize={22}
                maxBarSize={22}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
