import React from 'react';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface CashFlowSectionProps {
  debts: { budget: number; actual: number };
  savings: { budget: number; actual: number };
  bills: { budget: number; actual: number };
  expenses: { budget: number; actual: number };
  total: { budget: number; actual: number };
  currency: string;
}

export const CashFlowSection: React.FC<CashFlowSectionProps> = ({
  debts,
  savings,
  bills,
  expenses,
  total,
  currency
}) => {
  return (
    <div className="glass rounded-2xl p-6 animate-slide-in bg-gradient-to-br from-cyan-50/50 to-blue-50/50">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-cyan-500" size={20} />
        <h3 className="text-lg font-bold text-gray-700 tracking-wide">CASH FLOW SUMMARY</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-white/40">
              <th className="text-left py-3 font-bold text-gray-700">Name</th>
              <th className="text-right py-3 font-bold text-gray-700">Budget</th>
              <th className="text-right py-3 font-bold text-gray-700">Actual</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/20">
              <td className="py-3 font-medium text-gray-600">Debts</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(debts.budget, currency)}</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(debts.actual, currency)}</td>
            </tr>
            <tr className="border-b border-white/20">
              <td className="py-3 font-medium text-gray-600">Savings</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(savings.budget, currency)}</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(savings.actual, currency)}</td>
            </tr>
            <tr className="border-b border-white/20">
              <td className="py-3 font-medium text-gray-600">Bills</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(bills.budget, currency)}</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(bills.actual, currency)}</td>
            </tr>
            <tr className="border-b border-white/20">
              <td className="py-3 font-medium text-gray-600">Expenses</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(expenses.budget, currency)}</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(expenses.actual, currency)}</td>
            </tr>
            <tr className="glass-strong">
              <td className="py-3 font-bold text-gray-800">Total</td>
              <td className="py-3 text-right font-bold gradient-text">{formatCurrency(total.budget, currency)}</td>
              <td className="py-3 text-right font-bold gradient-text">{formatCurrency(total.actual, currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
