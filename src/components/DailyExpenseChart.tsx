import React from 'react';
import {
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
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
      <div className="chart-tooltip">
        <p className="font-semibold text-ink-900 dark:text-ink-100">{label}</p>
        <p className="font-semibold text-sky-700 dark:text-sky-300">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  };

  return (
    <section className="card card-pad chart-card daily-spending-card flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title font-heading">{t(language, 'dailyExpenseChart')}</h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            {t(language, 'dailyExpenseChartBody')}
          </p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center text-ink-500 dark:text-ink-400">
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
        <div className="daily-spending-plot">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
              barCategoryGap="28%"
            >
              <YAxis hide domain={[0, (maximum: number) => maximum * 1.18]} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} axisLine={false} tickLine={false}
                tick={{ fill: 'var(--chart-text)', fontSize: 11 }} minTickGap={24} dy={8} />
              <Tooltip
                cursor={{ fill: 'var(--chart-track)', radius: 6 }}
                content={<CustomTooltip />}
                labelFormatter={(value) => String(value)}
              />
              <Bar dataKey="total" radius={[8, 8, 2, 2]} fill="var(--chart-1)" maxBarSize={44} isAnimationActive={false}>
                {chartData.length <= 10 && <LabelList dataKey="total" position="top" formatter={(value: number) => new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)} fill="var(--chart-text)" fontSize={11} />}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
