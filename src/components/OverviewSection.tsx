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
    <div className="glass rounded-2xl p-6 animate-slideUp">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="text-cyan-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">OVERVIEW</h2>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">Start Date</span>
          <input
            type="date"
            value={settings.startDate}
            onChange={(e) => updateSettings({ startDate: e.target.value })}
            className="bg-white/40 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">End Date</span>
          <input
            type="date"
            value={settings.endDate}
            onChange={(e) => updateSettings({ endDate: e.target.value })}
            className="bg-white/40 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">Start Balance</span>
          <span className="text-sm font-bold text-cyan-600">{formatCurrency(settings.startBalance, settings.currency)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium text-gray-700">Money per day</span>
          <span className="text-sm font-bold text-cyan-600">{formatCurrency(perDay, settings.currency)}</span>
        </div>
      </div>
    </div>
  );
};
