import React from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface BudgetChartProps {
  data: {
    debts: { budget: number; actual: number };
    savings: { budget: number; actual: number };
    bills: { budget: number; actual: number };
    expenses: { budget: number; actual: number };
  };
}

export const BudgetChart: React.FC<BudgetChartProps> = ({ data }) => {
  const chartData = {
    labels: ['Debts', 'Savings', 'Bills', 'Expenses'],
    datasets: [
      {
        label: 'Budget',
        data: [data.debts.budget, data.savings.budget, data.bills.budget, data.expenses.budget],
        backgroundColor: 'rgba(244, 215, 201, 0.8)',
        borderColor: 'rgba(244, 215, 201, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Actual',
        data: [data.debts.actual, data.savings.actual, data.bills.actual, data.expenses.actual],
        backgroundColor: 'rgba(245, 168, 154, 0.8)',
        borderColor: 'rgba(245, 168, 154, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#4a5568',
          font: { size: 12, weight: 'bold' as const }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.3)' },
        ticks: {
          color: '#4a5568',
          callback: (value: any) => `₫ ${value.toLocaleString()}`
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#4a5568' }
      }
    }
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-700 mb-4 tracking-wide">BUDGET VS. ACTUAL</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

interface CategoryPieChartProps {
  categories: { label: string; value: number; percentage: number }[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ categories }) => {
  const chartData = {
    labels: categories.map(c => `${c.label}\n${c.percentage.toFixed(1)}%`),
    datasets: [{
      data: categories.map(c => c.percentage),
      backgroundColor: [
        'rgba(245, 168, 154, 0.9)',
        'rgba(244, 215, 201, 0.9)',
        'rgba(212, 232, 232, 0.9)',
        'rgba(255, 200, 150, 0.9)',
        'rgba(200, 180, 200, 0.9)',
        'rgba(255, 220, 180, 0.9)',
        'rgba(220, 200, 180, 0.9)',
        'rgba(180, 220, 220, 0.9)'
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#4a5568',
          font: { size: 11, weight: 'bold' as const },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = categories[context.dataIndex].label;
            return `${label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-700 mb-4 tracking-wide">EXPENSE CATEGORY BREAKDOWN</h3>
      <Pie data={chartData} options={options} />
    </div>
  );
};
