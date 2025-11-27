import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface SummaryCardProps {
  label: string;
  value: number;
  currency: string;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  percentage?: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  label, 
  value, 
  currency, 
  trend,
  icon,
  percentage 
}) => {
  return (
    <div className="glass glass-hover rounded-2xl p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {icon && <div className="text-purple-500">{icon}</div>}
        {trend && (
          <div className={`${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold gradient-text">
        {formatCurrency(value, currency)}
      </p>
      {percentage !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-rose-400 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-gray-700 mt-2">{percentage}%</p>
        </div>
      )}
    </div>
  );
};

interface HeaderProps {
  month: string;
  budgeted: number;
  leftToBudget: number;
  income: number;
  totalSpent: number;
  savings: number;
  leftOver: number;
  spentPercentage: number;
  currency: string;
}

export const Header: React.FC<HeaderProps> = ({
  month,
  budgeted,
  leftToBudget,
  income,
  totalSpent,
  savings,
  leftOver,
  spentPercentage,
  currency
}) => {
  return (
    <div className="glass-strong rounded-3xl p-8 mb-8 animate-slide-up">
      <h1 className="text-5xl font-bold tracking-[0.3em] gradient-text mb-8">
        {month}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <SummaryCard 
          label="Budgeted" 
          value={budgeted} 
          currency={currency}
          icon={<Wallet size={20} />}
        />
        <SummaryCard 
          label="Left to Budget" 
          value={leftToBudget} 
          currency={currency}
          trend={leftToBudget > 0 ? 'up' : 'down'}
        />
        <SummaryCard 
          label="Income" 
          value={income} 
          currency={currency}
          icon={<TrendingUp size={20} />}
        />
        <SummaryCard 
          label="Total Spent" 
          value={totalSpent} 
          currency={currency}
          trend="down"
        />
        <SummaryCard 
          label="Progress" 
          value={totalSpent} 
          currency={currency}
          percentage={spentPercentage}
        />
        <SummaryCard 
          label="Savings" 
          value={savings} 
          currency={currency}
          icon={<PiggyBank size={20} />}
        />
        <SummaryCard 
          label="Left Over" 
          value={leftOver} 
          currency={currency}
          trend={leftOver > 0 ? 'up' : 'down'}
        />
      </div>
    </div>
  );
};
