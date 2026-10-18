import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ConfirmToast } from './ConfirmToast';
import { t } from '../i18n';
import { TableAddRowButton } from './TableAddRowButton';

export const Debt: React.FC = () => {
  const { debts, addDebt, removeDebt, updateDebt, uiSettings, readOnly, debtGoals, addDebtGoal, updateDebtGoal, removeDebtGoal, sheets } = useApp();
  const [maxRows, setMaxRows] = useState(5);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const { language } = uiSettings;
  const visibleRows = Math.max(maxRows, debts.length);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseNumber = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  const totalDebt = debts.reduce((sum, item) => sum + item.amount, 0);
  const paidByGoal = (goalId: string) => sheets.reduce((sum, sheet) => sum + sheet.debts.reduce((monthSum, item) => monthSum + (item.goalId === goalId ? item.amount : 0), 0), 0);

  const handleCellChange = (index: number, field: 'description' | 'amount' | 'date' | 'goalId', value: string) => {
    const existingItem = debts[index];
    
    if (existingItem) {
      // Update existing item
      if (field === 'description') {
        if (value.trim() === '' && (!existingItem.amount || existingItem.amount === 0) && !existingItem.date) {
          removeDebt(existingItem.id);
        } else {
          updateDebt(existingItem.id, { description: value });
        }
      } else if (field === 'amount') {
        const numValue = parseNumber(value);
        if (numValue === 0 && !existingItem.description.trim() && !existingItem.date) {
          removeDebt(existingItem.id);
        } else {
          updateDebt(existingItem.id, { [field]: numValue });
        }
      } else if (field === 'date') {
        if (!value && !existingItem.description.trim() && (!existingItem.amount || existingItem.amount === 0)) {
          removeDebt(existingItem.id);
        } else {
          updateDebt(existingItem.id, { date: value });
        }
      } else {
        updateDebt(existingItem.id, { goalId: value || undefined });
      }
    } else {
      // Create new item
      if (field === 'description' && value.trim()) {
        addDebt({ description: value, amount: 0, date: '' });
      } else if (field === 'amount' && value) {
        const numValue = parseNumber(value);
        if (numValue > 0) {
          addDebt({ description: '', amount: numValue, date: '' });
        }
      } else if (field === 'date' && value) {
        addDebt({ description: '', amount: 0, date: value });
      } else if (field === 'goalId' && value) {
        addDebt({ description: '', amount: 0, date: '', goalId: value });
      }
    }
  };

  const handleClearAll = () => {
    if (debts.length === 0) return;
    setConfirmOpen(true);
  };

  const handleConfirmClearAll = () => {
    debts.forEach((item) => removeDebt(item.id));
    setConfirmOpen(false);
  };

  const handleRemoveRow = (index: number) => {
    const item = debts[index];
    if (item) {
      removeDebt(item.id);
    }
    setMaxRows((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleAddRow = () => {
    const newRowIndex = visibleRows;
    setMaxRows(visibleRows + 1);
    window.setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(`[data-debt-row="${newRowIndex}"] input`);
      input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input?.focus({ preventScroll: true });
    }, 0);
  };

  const renderRow = (index: number) => {
    const item = debts[index];
    
    return (
      <tr key={index} className="table-row" data-debt-row={index}>
        <td className="w-[24%] py-2 px-2 border-r border-ink-100/70" data-label={t(language, 'description')}>
          <input
            type="text"
            value={item?.description || ''}
            onChange={(e) => handleCellChange(index, 'description', e.target.value)}
            className="input-ghost"
            placeholder={t(language, 'enterDescription')}
            disabled={readOnly}
          />
        </td>
        <td className="w-[22%] py-2 px-1 border-r border-ink-100/70" data-label={t(language, 'dueDate')}>
          <input
            type="date"
            value={item?.date || ''}
            onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
            onChange={(e) => handleCellChange(index, 'date', e.target.value)}
            className="input-ghost [&::-webkit-calendar-picker-indicator]:hidden [&:not(:focus):invalid]:text-transparent"
            disabled={readOnly}
          />
        </td>
        <td className="w-[22%] py-2 px-1 border-r border-ink-100/70" data-label={t(language, 'amount')}>
          <input
            type="text"
            inputMode="numeric"
            value={item?.amount ? formatCurrency(item.amount) : ''}
            onChange={(e) => handleCellChange(index, 'amount', e.target.value)}
            className="input-ghost tabular-nums"
            placeholder="0"
            disabled={readOnly}
          />
        </td>
        <td className="w-[20%] py-2 px-1 border-r border-ink-100/70" data-label="Goal">
          <select value={item?.goalId ?? ''} onChange={(e) => handleCellChange(index, 'goalId', e.target.value)} className="input-ghost min-w-0 px-1 text-sm" disabled={readOnly}>
            <option value="">{language === 'vi' ? 'Không chọn' : 'No goal'}</option>
            {debtGoals.map(goal => <option key={goal.id} value={goal.id}>{goal.name}</option>)}
          </select>
        </td>
        <td className="w-[12%] py-2 px-1 text-center" data-label={t(language, 'action')}>
          <div className="flex items-center justify-center gap-2">
            {item ? (
              <button
                onClick={() => removeDebt(item.id)}
                className="text-amber-600 hover:text-amber-700 font-medium p-1 transition-transform duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                title={t(language, 'clearRow')}
                disabled={readOnly}
              >
                <svg className="w-5 h-5 transition-transform duration-200 hover:-rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H8m0 0l3.5-3.5M8 12l3.5 3.5M4 20h10a2 2 0 002-2v-2" />
                </svg>
              </button>
            ) : null}
            <button
              onClick={() => handleRemoveRow(index)}
              className={`text-rose-600 hover:text-rose-700 font-medium p-1 transition-transform duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${visibleRows <= 1 ? 'opacity-40 pointer-events-none' : ''}`}
              title={t(language, 'removeRow')}
              disabled={readOnly || visibleRows <= 1}
            >
              <svg className="w-5 h-5 transition-transform duration-200 hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M10 10v6M14 10v6" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <section className="card card-pad mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title font-heading">{t(language, 'debt')}</h2>
        <div className="relative flex items-center gap-3">
          <button onClick={() => setShowGoals(value => !value)} className="btn-ghost" disabled={readOnly}>{language === 'vi' ? 'Quản lý Goal' : 'Manage Goals'}</button>
          <button
            onClick={handleAddRow}
            className="btn-ghost group transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title={t(language, 'addRow')}
            disabled={readOnly}
          >
            <svg className="w-5 h-5 animate-pop-in transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleClearAll}
            className="btn-ghost text-rose-600 hover:text-rose-700 disabled:opacity-50 disabled:pointer-events-none"
            title={t(language, 'confirmClearDebt')}
            disabled={readOnly}
          >
            {t(language, 'clearAll')}
          </button>
          <div className="rounded-full border border-rose-200/60 bg-rose-50/70 px-4 py-2 dark:bg-rose-500/10 dark:border-rose-500/30">
            <span className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">{t(language, 'total')}</span>
            <span className="ml-2 text-sm font-bold text-rose-800 dark:text-rose-300">{formatCurrency(totalDebt)}</span>
          </div>
          <ConfirmToast
            open={confirmOpen}
            message={t(language, 'confirmClearDebt')}
            subtext={t(language, 'confirmSubtext')}
            confirmLabel={t(language, 'clearAll')}
            cancelLabel={t(language, 'cancel')}
            positionClassName="absolute right-0 top-full mt-2 z-50"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmClearAll}
          />
        </div>
      </div>

      {showGoals && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={event => { if (event.target === event.currentTarget) setShowGoals(false); }}>
        <div className="card card-pad w-full max-w-2xl shadow-2xl">
          <div className="mb-4 flex items-center justify-between"><div><h3 className="section-title">{language === 'vi' ? 'Quản lý Goal' : 'Manage Goals'}</h3><p className="mt-1 text-xs text-ink-500">{language === 'vi' ? 'Goal dùng chung cho tất cả các sheet.' : 'Goals are shared across all sheets.'}</p></div><button className="btn-ghost" onClick={() => setShowGoals(false)}>×</button></div>
          {!readOnly && <form className="mb-4 flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); const amount = parseNumber(goalAmount); if (!goalName.trim() || amount <= 0) return; addDebtGoal({ name: goalName, amount }); setGoalName(''); setGoalAmount(''); }}>
            <input className="input min-w-36 flex-1" value={goalName} onChange={event => setGoalName(event.target.value)} placeholder={language === 'vi' ? 'Tên Goal, ví dụ Xe' : 'Goal name, e.g. Car'} />
            <input className="input w-36" inputMode="numeric" value={goalAmount} onChange={event => setGoalAmount(event.target.value)} placeholder={language === 'vi' ? 'Tổng tiền' : 'Total amount'} />
            <button className="btn-primary" type="submit">{language === 'vi' ? 'Thêm Goal' : 'Add Goal'}</button>
          </form>}
          {debtGoals.length ? <div className="max-h-[60vh] space-y-3 overflow-y-auto">{debtGoals.map(goal => { const paid = paidByGoal(goal.id); return <div key={goal.id} className="rounded-xl border border-ink-200/70 p-3 dark:border-ink-700/70">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_170px_auto]">
              <input aria-label="Goal name" className="input" defaultValue={goal.name} disabled={readOnly} onBlur={event => updateDebtGoal(goal.id, { name: event.target.value })} />
              <input aria-label="Goal total amount" className="input" type="number" min="1" defaultValue={goal.amount} disabled={readOnly} onBlur={event => updateDebtGoal(goal.id, { amount: Number(event.target.value) })} />
              {!readOnly && <button onClick={() => removeDebtGoal(goal.id)} className="btn-ghost text-rose-600">{language === 'vi' ? 'Xóa' : 'Delete'}</button>}
            </div>
            <p className="mt-2 text-xs text-ink-500">{language === 'vi' ? 'Đã trả' : 'Paid'} {formatCurrency(paid)} · {language === 'vi' ? 'Còn lại' : 'Remaining'} {formatCurrency(Math.max(0, goal.amount - paid))} / {formatCurrency(goal.amount)}</p>
          </div>; })}</div> : <p className="text-sm text-ink-500">{language === 'vi' ? 'Chưa có Goal nào.' : 'No goals yet.'}</p>}
        </div>
      </div>}

      <div className="table-shell">
        <table className="w-full table-fixed table-responsive">
          <thead className="table-head">
            <tr className="border-b border-ink-100/80">
              <th className="w-[24%] text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">{t(language, 'description')}</th>
              <th className="w-[22%] text-center py-3 px-1 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">{t(language, 'dueDate')}</th>
              <th className="w-[22%] text-left py-3 px-1 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">{t(language, 'amount')}</th>
              <th className="w-[20%] text-left py-3 px-1 text-xs font-semibold uppercase tracking-wide text-ink-500 border-r border-ink-100/70">Goal</th>
              <th className="w-[12%] text-center py-3 px-1 text-xs font-semibold uppercase tracking-wide text-ink-500">{t(language, 'action')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: visibleRows }, (_, index) => renderRow(index))}
          </tbody>
        </table>
      </div>
      {!readOnly && <TableAddRowButton label={t(language, 'addRow')} onClick={handleAddRow} />}
    </section>
  );
};
