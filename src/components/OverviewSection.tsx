import React from 'react';
import { Settings } from 'lucide-react';
import { calculateDaysBetween, formatCurrency } from '../utils/helpers';
import { BudgetData } from '../types';

interface OverviewSectionProps {
  settings: BudgetData['settings'];
  leftOver: number;
  updateSettings: (settings: Partial<BudgetData['settings']>) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ settings, leftOver, updateSettings }) => {
  const days = calculateDaysBetween(settings.startDate, settings.endDate);
  const perDay = days > 0 ? leftOver / days : 0;

  return (
    <div className="glass rounded-2xl p-6 animate-slide-in">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="text-purple-500" size={20} />
        <h3 className="text-lg font-bold text-gray-700 tracking-wide">OVERVIEW</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-white/30">
          <span className="text-sm font-medium text-gray-600">Currency</span>
          <select
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
            className="glass px-3 py-1 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="₫">₫</option>
            <option value="$">$</option>
            <option value="€">€</option>
          </select>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/30">
          <span className="text-sm font-medium text-gray-600">Start Date</span>
          <input
            type="date"
            value={settings.startDate}
            onChange={(e) => updateSettings({ startDate: e.target.value })}
            className="glass px-3 py-1 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/30">
          <span className="text-sm font-medium text-gray-600">End Date</span>
          <input
            type="date"
            value={settings.endDate}
            onChange={(e) => updateSettings({ endDate: e.target.value })}
            className="glass px-3 py-1 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/30">
          <span className="text-sm font-medium text-gray-600">Start Balance</span>
          <span className="text-sm font-bold gradient-text">{formatCurrency(settings.startBalance, settings.currency)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium text-gray-600">Money per day</span>
          <span className="text-sm font-bold gradient-text">{formatCurrency(perDay, settings.currency)}</span>
        </div>
      </div>
    </div>
  );
};
