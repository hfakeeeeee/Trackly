import React, { useEffect } from 'react';
import { useApp } from '../AppContext';
import { differenceInDays, format } from 'date-fns';
import { t } from '../i18n';

export const Overview: React.FC = () => {
  const {
    periodSettings,
    updatePeriod,
    getRemainingAmount,
    uiSettings,
    currentSheet,
    setDailyAllowanceSnapshot,
  } = useApp();
  const { language } = uiSettings;

  const toNumber = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d-]/g, '');
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const startDate = new Date(periodSettings.startDate);
  const endDate = new Date(periodSettings.endDate);
  const daysRemaining = Math.max(0, differenceInDays(endDate, startDate) + 1);
  const remainingAmount = getRemainingAmount();
  const safeRemainingAmount = Number.isFinite(remainingAmount) ? remainingAmount : 0;
  const computedDailyAllowance = daysRemaining > 0 ? safeRemainingAmount / daysRemaining : 0;
  const roundedComputedDaily = Math.round(computedDailyAllowance);
  const snapshotAmount =
    currentSheet.allowanceSnapshot?.date === todayKey
      ? toNumber(currentSheet.allowanceSnapshot.amount)
      : undefined;
  const snapshotRounded = snapshotAmount !== undefined ? Math.round(snapshotAmount) : undefined;
  const dailyAllowance =
    snapshotRounded !== undefined && snapshotRounded !== 0
      ? snapshotRounded
      : roundedComputedDaily;
  const nextDayAllowance =
    daysRemaining > 1 ? safeRemainingAmount / (daysRemaining - 1) : 0;

  useEffect(() => {
    const totalMagnitude =
      currentSheet.income.reduce((sum, item) => sum + Math.abs(toNumber(item.amount)), 0) +
      currentSheet.debts.reduce((sum, item) => sum + Math.abs(toNumber(item.amount)), 0) +
      currentSheet.savings.reduce((sum, item) => sum + Math.abs(toNumber(item.amount)), 0) +
      currentSheet.bills.reduce((sum, item) => sum + Math.abs(toNumber(item.amount)), 0) +
      currentSheet.expenses.reduce((sum, item) => sum + Math.abs(toNumber(item.amount)), 0);
    const hasMeaningfulData = totalMagnitude > 0;
    const snapshotIsToday = currentSheet.allowanceSnapshot?.date === todayKey;
    const snapshotValue = snapshotIsToday ? toNumber(currentSheet.allowanceSnapshot?.amount) : undefined;
    const snapshotRoundedValue = snapshotValue !== undefined ? Math.round(snapshotValue) : undefined;
    const shouldRefreshZeroSnapshot =
      snapshotIsToday &&
      snapshotRoundedValue === 0 &&
      roundedComputedDaily !== 0;

    if (hasMeaningfulData && (!snapshotIsToday || shouldRefreshZeroSnapshot)) {
      setDailyAllowanceSnapshot({ date: todayKey, amount: roundedComputedDaily });
    }
  }, [
    roundedComputedDaily,
    currentSheet.allowanceSnapshot?.date,
    currentSheet.allowanceSnapshot?.amount,
    currentSheet.bills.length,
    currentSheet.debts.length,
    currentSheet.expenses.length,
    currentSheet.income.length,
    currentSheet.savings.length,
    setDailyAllowanceSnapshot,
    todayKey,
  ]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePeriod(e.target.value, periodSettings.endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePeriod(periodSettings.startDate, e.target.value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="card card-pad mb-6 h-full flex flex-col">
      <h2 className="section-title font-heading mb-4">{t(language, 'overview')}</h2>
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">{t(language, 'startDate')}</label>
          <input
            type="date"
            value={periodSettings.startDate}
            onChange={handleStartDateChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">{t(language, 'endDate')}</label>
          <input
            type="date"
            value={periodSettings.endDate}
            onChange={handleEndDateChange}
            className="input"
          />
        </div>
        <div className="rounded-xl border border-ink-100/70 bg-sand-50/70 p-4 dark:border-ink-700/70 dark:bg-ink-900/80">
          <p className="text-xs uppercase tracking-wide text-ink-600 mb-1 font-semibold dark:text-ink-300">{t(language, 'daysRemaining')}</p>
          <p className="text-3xl font-bold text-ink-900 dark:text-ink-100">{daysRemaining}</p>
        </div>
        <div className="rounded-xl border border-teal-200/60 bg-teal-50/60 p-4 dark:border-teal-500/30 dark:bg-teal-500/10">
          <p className="text-xs uppercase tracking-wide text-ink-500 mb-1 dark:text-ink-300">{t(language, 'dailyAllowance')}</p>
          <p className={`text-2xl font-semibold ${dailyAllowance < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-teal-700 dark:text-teal-300'}`}>
            {formatCurrency(dailyAllowance)}
          </p>
        </div>
        <div className="rounded-xl border border-sky-200/60 bg-sky-50/70 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
          <p className="text-xs uppercase tracking-wide text-ink-500 mb-1 dark:text-ink-300">{t(language, 'nextDayAllowance')}</p>
          <p className={`text-2xl font-semibold ${nextDayAllowance < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-sky-700 dark:text-sky-300'}`}>
            {formatCurrency(nextDayAllowance)}
          </p>
        </div>
      </div>
    </section>
  );
};
