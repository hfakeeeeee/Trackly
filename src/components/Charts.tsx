import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryPieChartProps {
  categories: { label: string; value: number; percentage: number; color: string }[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ categories }) => {
  const chartData = {
    labels: categories.map(c => `${c.label} - ${c.percentage.toFixed(1)}%`),
    datasets: [{
      data: categories.map(c => c.value),
      backgroundColor: categories.map(c => c.color),
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 2,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#1f2937',
          font: { size: 12, weight: 'bold' as const },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context: any) => {
            const category = categories[context.dataIndex];
            return `${category.value.toLocaleString()} ₫ (${category.percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slideUp">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">EXPENSE BREAKDOWN</h2>
      <div className="h-[300px] flex items-center justify-center">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};
