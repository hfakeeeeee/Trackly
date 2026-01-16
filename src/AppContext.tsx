import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, IncomeItem, DebtItem, SavingsItem, BillItem, ExpenseItem, Category } from './types';

interface AppContextType extends AppState {
  addIncome: (item: Omit<IncomeItem, 'id'>) => void;
  removeIncome: (id: string) => void;
  addDebt: (item: Omit<DebtItem, 'id'>) => void;
  removeDebt: (id: string) => void;
  addSavings: (item: Omit<SavingsItem, 'id'>) => void;
  removeSavings: (id: string) => void;
  addBill: (item: Omit<BillItem, 'id'>) => void;
  removeBill: (id: string) => void;
  addExpense: (item: Omit<ExpenseItem, 'id'>) => void;
  removeExpense: (id: string) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  updatePeriod: (startDate: string, endDate: string) => void;
  getTotalIncome: () => number;
  getTotalSavings: () => number;
  getTotalExpenses: () => number;
  getRemainingAmount: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'trackly-data';

const defaultState: AppState = {
  periodSettings: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  },
  income: [],
  debts: [],
  savings: [],
  bills: [],
  expenses: [],
  categories: [
    { id: '1', name: 'Food & Dining', total: 0 },
    { id: '2', name: 'Transportation', total: 0 },
    { id: '3', name: 'Shopping', total: 0 },
    { id: '4', name: 'Entertainment', total: 0 },
    { id: '5', name: 'Healthcare', total: 0 },
    { id: '6', name: 'Others', total: 0 },
  ],
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const addIncome = (item: Omit<IncomeItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      income: [...prev.income, { ...item, id: generateId() }],
    }));
  };

  const removeIncome = (id: string) => {
    setState(prev => ({
      ...prev,
      income: prev.income.filter(item => item.id !== id),
    }));
  };

  const addDebt = (item: Omit<DebtItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      debts: [...prev.debts, { ...item, id: generateId() }],
    }));
  };

  const removeDebt = (id: string) => {
    setState(prev => ({
      ...prev,
      debts: prev.debts.filter(item => item.id !== id),
    }));
  };

  const addSavings = (item: Omit<SavingsItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      savings: [...prev.savings, { ...item, id: generateId() }],
    }));
  };

  const removeSavings = (id: string) => {
    setState(prev => ({
      ...prev,
      savings: prev.savings.filter(item => item.id !== id),
    }));
  };

  const addBill = (item: Omit<BillItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      bills: [...prev.bills, { ...item, id: generateId() }],
    }));
  };

  const removeBill = (id: string) => {
    setState(prev => ({
      ...prev,
      bills: prev.bills.filter(item => item.id !== id),
    }));
  };

  const addExpense = (item: Omit<ExpenseItem, 'id'>) => {
    const newExpense = { ...item, id: generateId() };
    setState(prev => {
      const updatedCategories = prev.categories.map(cat => {
        if (cat.name === item.category) {
          return { ...cat, total: cat.total + item.amount };
        }
        return cat;
      });

      return {
        ...prev,
        expenses: [...prev.expenses, newExpense],
        categories: updatedCategories,
      };
    });
  };

  const removeExpense = (id: string) => {
    setState(prev => {
      const expense = prev.expenses.find(e => e.id === id);
      if (!expense) return prev;

      const updatedCategories = prev.categories.map(cat => {
        if (cat.name === expense.category) {
          return { ...cat, total: Math.max(0, cat.total - expense.amount) };
        }
        return cat;
      });

      return {
        ...prev,
        expenses: prev.expenses.filter(item => item.id !== id),
        categories: updatedCategories,
      };
    });
  };

  const addCategory = (name: string) => {
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, { id: generateId(), name, total: 0 }],
    }));
  };

  const removeCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id),
    }));
  };

  const updatePeriod = (startDate: string, endDate: string) => {
    setState(prev => ({
      ...prev,
      periodSettings: { startDate, endDate },
    }));
  };

  const getTotalIncome = () => {
    return state.income.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalSavings = () => {
    return state.savings.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalExpenses = () => {
    return state.expenses.reduce((sum, item) => sum + item.amount, 0);
  };

  const getRemainingAmount = () => {
    return getTotalIncome() - getTotalSavings() - getTotalExpenses();
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addIncome,
        removeIncome,
        addDebt,
        removeDebt,
        addSavings,
        removeSavings,
        addBill,
        removeBill,
        addExpense,
        removeExpense,
        addCategory,
        removeCategory,
        updatePeriod,
        getTotalIncome,
        getTotalSavings,
        getTotalExpenses,
        getRemainingAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
