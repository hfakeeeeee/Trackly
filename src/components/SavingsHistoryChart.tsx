import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../AppContext';

interface SavingsHistoryChartProps { onClose: () => void }

export const SavingsHistoryChart: React.FC<SavingsHistoryChartProps> = ({ onClose }) => {
  const { sheets } = useApp();
  const data = [...sheets].sort((a, b) => a.periodSettings.startDate.localeCompare(b.periodSettings.startDate)).map(sheet => ({
    month: sheet.name,
    saved: sheet.savings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
  }));
  const currency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
  const totalSaved = data.reduce((sum, item) => sum + item.saved, 0);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="card card-pad w-full max-w-4xl shadow-2xl">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="section-title font-heading mb-1">Savings history</h2><p className="text-xs text-ink-500">Across all monthly sheets</p></div><button type="button" className="btn-ghost" onClick={onClose}>Close</button></div>
      <div className="mb-4 rounded-xl border border-teal-200/60 bg-teal-50/70 p-3 dark:border-teal-500/30 dark:bg-teal-500/10"><p className="text-xs text-ink-500">Total saved</p><p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{currency(totalSaved)}</p></div>
      {data.some(item => item.saved > 0) ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis tickFormatter={currency} /><Tooltip formatter={(value) => currency(Number(value))} /><Bar dataKey="saved" name="Saved" fill="#10b981" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div> : <p className="text-sm text-ink-500">No savings recorded yet.</p>}
    </section>
  </div>;
};
