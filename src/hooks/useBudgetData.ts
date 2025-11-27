import { useState, useEffect } from 'react';
import { BudgetData } from '../types';
import { getInitialData, saveData } from '../utils/helpers';

export const useBudgetData = () => {
  const [data, setData] = useState<BudgetData>(getInitialData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateIncome = (income: BudgetData['income']) => {
    setData(prev => ({ ...prev, income }));
  };

  const updateDebts = (debts: BudgetData['debts']) => {
    setData(prev => ({ ...prev, debts }));
  };

  const updateBills = (bills: BudgetData['bills']) => {
    setData(prev => ({ ...prev, bills }));
  };

  const updateExpenses = (expenses: BudgetData['expenses']) => {
    setData(prev => ({ ...prev, expenses }));
  };

  const updateSavings = (savings: BudgetData['savings']) => {
    setData(prev => ({ ...prev, savings }));
  };

  const updateExpenseTracker = (expenseTracker: BudgetData['expenseTracker']) => {
    setData(prev => ({ ...prev, expenseTracker }));
  };

  const updateSettings = (settings: Partial<BudgetData['settings']>) => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, ...settings } }));
  };

  return {
    data,
    updateIncome,
    updateDebts,
    updateBills,
    updateExpenses,
    updateSavings,
    updateExpenseTracker,
    updateSettings
  };
};
