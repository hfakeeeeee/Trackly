import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface SummaryCardProps {
  label: string;
  value: number;
  currency: string;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  label, 
  value, 
  currency, 
  trend,
  icon,
  className = ''
}) => {
  return (
    <div className={`glass glass-hover rounded-2xl p-6 animate-fadeIn ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {icon && <div className="text-purple-600">{icon}</div>}
        {trend && (
          <div className={`${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-800">
        {formatCurrency(value, currency)}
      </p>
    </div>
  );
};

interface HeaderProps {
  month: string;
  income: number;
  totalSpent: number;
  savings: number;
  leftOver: number;
  currency: string;
}

export const Header: React.FC<HeaderProps> = ({
  month,
  income,
  totalSpent,
  savings,
  leftOver,
  currency
}) => {
  return (
    <div className="glass-strong rounded-3xl p-8 animate-slideUp">
      <h1 className="text-6xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 mb-8">
        {month}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard 
          label="INCOME" 
          value={income} 
          currency={currency}
          icon={<TrendingUp size={24} />}
          className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
        />
        <SummaryCard 
          label="TOTAL SPENT" 
          value={totalSpent} 
          currency={currency}
          icon={<Wallet size={24} />}
          className="bg-gradient-to-br from-rose-500/10 to-red-500/10"
        />
        <SummaryCard 
          label="SAVINGS" 
          value={savings} 
          currency={currency}
          icon={<PiggyBank size={24} />}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
        />
        <SummaryCard 
          label="LEFT OVER" 
          value={leftOver} 
          currency={currency}
          trend={leftOver >= 0 ? 'up' : 'down'}
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10"
        />
      </div>
    </div>
  );
};