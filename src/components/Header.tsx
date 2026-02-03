import React from 'react';
import { useApp } from '../AppContext';
import { format } from 'date-fns';
import { t } from '../i18n';

export const Header: React.FC = () => {
  const {
    periodSettings,
    getTotalIncome,
    getTotalSavings,
    getTotalExpenses,
    getRemainingAmount,
    debts,
    bills,
    uiSettings,
    toggleTheme,
    setLanguage,
  } = useApp();
  const { language, theme } = uiSettings;

  const currentMonth = format(new Date(periodSettings.startDate), 'MMMM yyyy');
  const totalIncome = getTotalIncome();
  const totalSavings = getTotalSavings();
  const totalExpenses = getTotalExpenses();
  const totalDebts = debts.reduce((sum, item) => sum + item.amount, 0);
  const totalBills = bills.reduce((sum, item) => sum + item.amount, 0);
  const totalSpend = totalExpenses + totalDebts + totalBills;
  const remainingAmount = getRemainingAmount();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-sand-50 via-sand-100 to-sand-50 text-ink-900 shadow-float dark:bg-ink-900 dark:bg-none dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-60 w-60 rounded-full bg-teal-400/30 blur-3xl animate-slow-float animate-pulse-glow dark:bg-teal-500/30" />
        <div className="absolute -top-16 right-12 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl animate-slow-float animate-pulse-glow dark:bg-amber-400/30" />
        <div className="absolute -left-1/3 top-10 h-12 w-2/3 rotate-2 bg-gradient-to-r from-transparent via-ink-900/5 to-transparent blur-xl animate-shimmer dark:via-white/15" />
        <div className="absolute -bottom-20 left-1/3 h-40 w-2/3 rounded-full bg-gradient-to-r from-teal-400/20 via-amber-300/20 to-rose-300/20 blur-2xl animate-aurora dark:from-teal-500/20 dark:via-amber-400/20 dark:to-rose-400/20" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-100/80 to-transparent dark:from-ink-900/70" />
      </div>
      <div className="relative px-6 py-10 sm:px-10 animate-fade-in">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="pill inline-block bg-ink-900/10 text-ink-700 dark:bg-white/15 dark:text-white">
              {t(language, 'monthlySnapshot')}
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {currentMonth}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-600 dark:text-white/70">
            <span>{t(language, 'tagline')}</span>
            <div className="flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/70 px-2 py-1 dark:border-white/20 dark:bg-white/10">
              <span className="text-xs uppercase tracking-wide text-ink-500 dark:text-white/60">{t(language, 'theme')}</span>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1 rounded-full bg-ink-900/10 px-2 py-1 text-xs font-semibold text-ink-800 transition hover:bg-ink-900/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
                title={theme === 'dark' ? t(language, 'light') : t(language, 'dark')}
              >
                {theme === 'dark' ? t(language, 'dark') : t(language, 'light')}
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/70 px-2 py-1 dark:border-white/20 dark:bg-white/10">
              <span className="text-xs uppercase tracking-wide text-ink-500 dark:text-white/60">{t(language, 'language')}</span>
              <button
                onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
                className="inline-flex items-center gap-1 rounded-full bg-ink-900/10 px-2 py-1 text-xs font-semibold text-ink-800 transition hover:bg-ink-900/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
                title={language === 'en' ? 'Tiếng Việt' : 'English'}
              >
                {language === 'en' ? 'EN' : 'VI'}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="stat-card bg-white/90 text-ink-900 border-ink-200/70 dark:bg-ink-900/70 dark:text-white dark:border-white/10">
            <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-white/70">{t(language, 'totalIncome')}</p>
            <p className="mt-2 text-2xl font-semibold text-ink-900 dark:text-white">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="stat-card bg-white/90 text-ink-900 border-ink-200/70 dark:bg-ink-900/70 dark:text-white dark:border-white/10">
            <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-white/70">{t(language, 'totalSavings')}</p>
            <p className="mt-2 text-2xl font-semibold text-ink-900 dark:text-white">{formatCurrency(totalSavings)}</p>
          </div>
          <div className="stat-card bg-white/90 text-ink-900 border-ink-200/70 dark:bg-ink-900/70 dark:text-white dark:border-white/10">
            <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-white/70">{t(language, 'totalMoneySpent')}</p>
            <p className="mt-2 text-2xl font-semibold text-ink-900 dark:text-white">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="stat-card bg-white/90 text-ink-900 border-ink-200/70 dark:bg-ink-900/70 dark:text-white dark:border-white/10">
            <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-white/70">{t(language, 'remainingAmount')}</p>
            <p className={`mt-2 text-2xl font-semibold ${remainingAmount < 0 ? 'text-rose-600 dark:text-rose-200' : 'text-ink-900 dark:text-white'}`}>
              {formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
