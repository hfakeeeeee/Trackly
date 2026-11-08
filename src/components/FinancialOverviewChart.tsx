import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
    { name: t(language, 'debt'), value: totalDebt, color: 'var(--chart-4)' },
    { name: t(language, 'bills'), value: totalBills, color: 'var(--chart-3)' },
    { name: t(language, 'savings'), value: totalSavings, color: 'var(--chart-1)' },
    { name: t(language, 'expense'), value: totalExpenses, color: 'var(--chart-2)' },
  ].filter((item) => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="font-semibold text-ink-900 dark:text-ink-100">{payload[0].name}</p>
          <p className="text-teal-700 font-semibold dark:text-teal-300">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="card card-pad chart-card h-full flex flex-col">
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
        <div className="donut-layout">
          <div className="donut-visual">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius="72%" outerRadius="90%"
                  paddingAngle={chartData.length > 1 ? 4 : 0} cornerRadius={5} stroke="none"
                  dataKey="value" startAngle={90} endAngle={-270} isAnimationActive={false}>
                  {chartData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center"><span>{t(language, 'total')}</span><strong>{formatCurrency(chartData.reduce((sum, entry) => sum + entry.value, 0))}</strong></div>
          </div>
          <div className="chart-breakdown">
            {chartData.map(entry => {
              const percent = entry.value / chartData.reduce((sum, item) => sum + item.value, 0) * 100;
              return <div className="chart-breakdown-row" key={entry.name}>
                <div className="chart-breakdown-label"><span className="chart-dot" style={{ background: entry.color }} />{entry.name}</div>
                <div className="chart-breakdown-value"><span>{formatCurrency(entry.value)}</span><small>{percent.toFixed(1)}%</small></div>
                <div className="chart-track"><span style={{ width: `${percent}%`, background: entry.color }} /></div>
              </div>;
            })}
          </div>
        </div>
      )}
    </section>
  );
};
