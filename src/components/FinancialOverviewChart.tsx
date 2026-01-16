import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useApp } from '../AppContext';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

export const FinancialOverviewChart: React.FC = () => {
  const { debts, bills, savings, expenses } = useApp();

  const totalDebt = debts.reduce((sum, item) => sum + item.amount, 0);
  const totalBills = bills.reduce((sum, item) => sum + item.amount, 0);
  const totalSavings = savings.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  const chartData = [
    { name: 'Debt', value: totalDebt, color: '#ef4444' },
    { name: 'Bills', value: totalBills, color: '#f59e0b' },
    { name: 'Savings', value: totalSavings, color: '#10b981' },
    { name: 'Expenses', value: totalExpenses, color: '#8b5cf6' },
  ].filter((item) => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-primary-600 font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Financial Overview</h2>
      
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
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
            <p className="text-lg">No financial data yet</p>
            <p className="text-sm mt-1">Add income, expenses, or savings to see the overview</p>
          </div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
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
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {totalDebt > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Debt</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalDebt)}</p>
              </div>
            )}
            {totalBills > 0 && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Bills</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(totalBills)}</p>
              </div>
            )}
            {totalSavings > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Savings</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalSavings)}</p>
              </div>
            )}
            {totalExpenses > 0 && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(totalExpenses)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
