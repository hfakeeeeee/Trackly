import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppState, IncomeItem, DebtItem, SavingsItem, BillItem, ExpenseItem, Sheet, AllowanceSnapshot } from './types';
import { auth, db } from './firebase';

interface AppContextType extends AppState, Sheet {
  currentSheet: Sheet;
  setCurrentSheet: (id: string) => void;
  addSheet: (name?: string) => void;
  renameSheet: (id: string, name: string) => void;
  removeSheet: (id: string) => void;
  addIncome: (item: Omit<IncomeItem, 'id'>) => void;
  removeIncome: (id: string) => void;
  updateIncome: (id: string, item: Partial<Omit<IncomeItem, 'id'>>) => void;
  addDebt: (item: Omit<DebtItem, 'id'>) => void;
  removeDebt: (id: string) => void;
  updateDebt: (id: string, item: Partial<Omit<DebtItem, 'id'>>) => void;
  addSavings: (item: Omit<SavingsItem, 'id'>) => void;
  removeSavings: (id: string) => void;
  updateSavings: (id: string, item: Partial<Omit<SavingsItem, 'id'>>) => void;
  addBill: (item: Omit<BillItem, 'id'>) => void;
  removeBill: (id: string) => void;
  updateBill: (id: string, item: Partial<Omit<BillItem, 'id'>>) => void;
  addExpense: (item: Omit<ExpenseItem, 'id'>) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, item: Partial<Omit<ExpenseItem, 'id'>>) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void;
  updatePeriod: (startDate: string, endDate: string) => void;
  getTotalIncome: () => number;
  getTotalSavings: () => number;
  getTotalExpenses: () => number;
  getRemainingAmount: () => number;
  setDailyAllowanceSnapshot: (snapshot: AllowanceSnapshot) => void;
  user: User | null;
  authLoading: boolean;
  dataLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  themeTransitionId: number;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  setLanguage: (language: 'en' | 'vi') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultCategories = [
  { id: '1', name: 'Food & Dining', total: 0 },
  { id: '2', name: 'Transportation', total: 0 },
  { id: '3', name: 'Shopping', total: 0 },
  { id: '4', name: 'Entertainment', total: 0 },
  { id: '5', name: 'Healthcare', total: 0 },
  { id: '6', name: 'Others', total: 0 },
];

const createDefaultSheet = (name: string): Sheet => ({
  id: Date.now().toString(36) + Math.random().toString(36).substr(2),
  name,
  periodSettings: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  },
  income: [],
  debts: [],
  savings: [],
  bills: [],
  expenses: [],
  categories: defaultCategories.map(cat => ({ ...cat })),
  allowanceSnapshot: undefined,
});

const createDefaultState = (): AppState => {
  const defaultSheet = createDefaultSheet('Current Month');
  return {
    sheets: [defaultSheet],
    currentSheetId: defaultSheet.id,
    uiSettings: {
      theme: 'light',
      language: 'en',
    },
  };
};

const buildStateFromData = (parsed?: Partial<AppState> & Partial<Sheet>): AppState => {
  const baseState = createDefaultState();
  if (parsed?.sheets && parsed.sheets.length > 0) {
    return {
      ...baseState,
      ...parsed,
      currentSheetId: parsed.currentSheetId ?? parsed.sheets[0].id,
      uiSettings: {
        ...baseState.uiSettings,
        ...(parsed.uiSettings ?? {}),
      },
    };
  }

  if (!parsed) return baseState;

  const legacySheet: Sheet = {
    id: baseState.sheets[0].id,
    name: 'Current Month',
    periodSettings: parsed.periodSettings ?? baseState.sheets[0].periodSettings,
    income: parsed.income ?? [],
    debts: parsed.debts ?? [],
    savings: parsed.savings ?? [],
    bills: parsed.bills ?? [],
    expenses: parsed.expenses ?? [],
    categories: parsed.categories ?? defaultCategories.map(cat => ({ ...cat })),
    allowanceSnapshot: parsed.allowanceSnapshot,
  };

  return {
    ...baseState,
    sheets: [legacySheet],
    currentSheetId: legacySheet.id,
    uiSettings: {
      ...baseState.uiSettings,
      ...(parsed.uiSettings ?? {}),
    },
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => createDefaultState());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [themeTransitionId, setThemeTransitionId] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async authUser => {
      setUser(authUser);
      if (!authUser) {
        setState(createDefaultState());
        setDataLoading(false);
        setHydrated(false);
        setAuthLoading(false);
        return;
      }

      setDataLoading(true);
      try {
        const ref = doc(db, 'users', authUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setState(buildStateFromData(snap.data() as Partial<AppState> & Partial<Sheet>));
        } else {
          const initialState = createDefaultState();
          await setDoc(ref, initialState);
          setState(initialState);
        }
        setHydrated(true);
      } catch {
        setState(createDefaultState());
      } finally {
        setDataLoading(false);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !hydrated) return;
    const ref = doc(db, 'users', user.uid);
    setDoc(ref, state);
  }, [hydrated, state, user]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(state.uiSettings.theme);
    if (state.uiSettings.theme === 'dark') {
      root.classList.add('dark');
    }
    root.style.colorScheme = state.uiSettings.theme;
  }, [state.uiSettings.theme]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const getCurrentSheet = (s: AppState) => s.sheets.find(sheet => sheet.id === s.currentSheetId) ?? s.sheets[0];

  const setCurrentSheet = (id: string) => {
    setState(prev => ({
      ...prev,
      currentSheetId: prev.sheets.some(sheet => sheet.id === id) ? id : prev.currentSheetId,
    }));
  };

  const addSheet = (name?: string) => {
    const sheetName = name?.trim() || `Sheet ${state.sheets.length + 1}`;
    const newSheet = createDefaultSheet(sheetName);
    setState(prev => ({
      ...prev,
      sheets: [...prev.sheets, newSheet],
      currentSheetId: newSheet.id,
    }));
  };

  const renameSheet = (id: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === id ? { ...sheet, name: trimmedName } : sheet
      ),
    }));
  };

  const removeSheet = (id: string) => {
    setState(prev => {
      if (prev.sheets.length <= 1) return prev;
      const remainingSheets = prev.sheets.filter(sheet => sheet.id !== id);
      if (remainingSheets.length === prev.sheets.length) return prev;
      const nextSheetId = prev.currentSheetId === id ? remainingSheets[0].id : prev.currentSheetId;
      return {
        ...prev,
        sheets: remainingSheets,
        currentSheetId: nextSheetId,
      };
    });
  };

  const addIncome = (item: Omit<IncomeItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, income: [...sheet.income, { ...item, id: generateId() }] }
          : sheet
      ),
    }));
  };

  const removeIncome = (id: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, income: sheet.income.filter(item => item.id !== id) }
          : sheet
      ),
    }));
  };

  const updateIncome = (id: string, item: Partial<Omit<IncomeItem, 'id'>>) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, income: sheet.income.map(inc => inc.id === id ? { ...inc, ...item } : inc) }
          : sheet
      ),
    }));
  };

  const addDebt = (item: Omit<DebtItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, debts: [...sheet.debts, { ...item, id: generateId() }] }
          : sheet
      ),
    }));
  };

  const removeDebt = (id: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, debts: sheet.debts.filter(item => item.id !== id) }
          : sheet
      ),
    }));
  };

  const updateDebt = (id: string, item: Partial<Omit<DebtItem, 'id'>>) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, debts: sheet.debts.map(debt => debt.id === id ? { ...debt, ...item } : debt) }
          : sheet
      ),
    }));
  };

  const addSavings = (item: Omit<SavingsItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, savings: [...sheet.savings, { ...item, id: generateId() }] }
          : sheet
      ),
    }));
  };

  const removeSavings = (id: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, savings: sheet.savings.filter(item => item.id !== id) }
          : sheet
      ),
    }));
  };

  const updateSavings = (id: string, item: Partial<Omit<SavingsItem, 'id'>>) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, savings: sheet.savings.map(sav => sav.id === id ? { ...sav, ...item } : sav) }
          : sheet
      ),
    }));
  };

  const addBill = (item: Omit<BillItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, bills: [...sheet.bills, { ...item, id: generateId() }] }
          : sheet
      ),
    }));
  };

  const removeBill = (id: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, bills: sheet.bills.filter(item => item.id !== id) }
          : sheet
      ),
    }));
  };

  const updateBill = (id: string, item: Partial<Omit<BillItem, 'id'>>) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, bills: sheet.bills.map(bill => bill.id === id ? { ...bill, ...item } : bill) }
          : sheet
      ),
    }));
  };

  const addExpense = (item: Omit<ExpenseItem, 'id'>) => {
    const newExpense = { ...item, id: generateId() };
    setState(prev => {
      const updatedSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.currentSheetId) return sheet;
        const updatedCategories = sheet.categories.map(cat => {
          if (cat.name === item.category) {
            return { ...cat, total: cat.total + item.amount };
          }
          return cat;
        });

        return {
          ...sheet,
          expenses: [...sheet.expenses, newExpense],
          categories: updatedCategories,
        };
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  const removeExpense = (id: string) => {
    setState(prev => {
      const updatedSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.currentSheetId) return sheet;
        const expense = sheet.expenses.find(e => e.id === id);
        if (!expense) return sheet;

        const updatedCategories = sheet.categories.map(cat => {
          if (cat.name === expense.category) {
            return { ...cat, total: Math.max(0, cat.total - expense.amount) };
          }
          return cat;
        });

        return {
          ...sheet,
          expenses: sheet.expenses.filter(item => item.id !== id),
          categories: updatedCategories,
        };
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  const updateExpense = (id: string, item: Partial<Omit<ExpenseItem, 'id'>>) => {
    setState(prev => {
      const updatedSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.currentSheetId) return sheet;
        const oldExpense = sheet.expenses.find(e => e.id === id);
        if (!oldExpense) return sheet;

        const updatedExpense = { ...oldExpense, ...item };

        let updatedCategories = sheet.categories;
        if (item.category !== undefined || item.amount !== undefined) {
          updatedCategories = sheet.categories.map(cat => {
            if (cat.name === oldExpense.category) {
              const newTotal = Math.max(0, cat.total - oldExpense.amount);
              return { ...cat, total: newTotal };
            }
            return cat;
          }).map(cat => {
            if (cat.name === updatedExpense.category) {
              return { ...cat, total: cat.total + updatedExpense.amount };
            }
            return cat;
          });
        }

        return {
          ...sheet,
          expenses: sheet.expenses.map(exp => exp.id === id ? updatedExpense : exp),
          categories: updatedCategories,
        };
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  const addCategory = (name: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, categories: [...sheet.categories, { id: generateId(), name, total: 0 }] }
          : sheet
      ),
    }));
  };

  const removeCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, categories: sheet.categories.filter(cat => cat.id !== id) }
          : sheet
      ),
    }));
  };

  const updateCategory = (id: string, name: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, categories: sheet.categories.map(cat => cat.id === id ? { ...cat, name } : cat) }
          : sheet
      ),
    }));
  };

  const updatePeriod = (startDate: string, endDate: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, periodSettings: { startDate, endDate } }
          : sheet
      ),
    }));
  };

  const getTotalIncome = () => {
    const sheet = getCurrentSheet(state);
    return sheet.income.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalSavings = () => {
    const sheet = getCurrentSheet(state);
    return sheet.savings.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalExpenses = () => {
    const sheet = getCurrentSheet(state);
    return sheet.expenses.reduce((sum, item) => sum + item.amount, 0);
  };

  const getRemainingAmount = () => {
    const sheet = getCurrentSheet(state);
    const totalDebts = sheet.debts.reduce((sum, item) => sum + item.amount, 0);
    const totalBills = sheet.bills.reduce((sum, item) => sum + item.amount, 0);
    return getTotalIncome() - getTotalSavings() - getTotalExpenses() - totalDebts - totalBills;
  };

  const setDailyAllowanceSnapshot = (snapshot: AllowanceSnapshot) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.currentSheetId
          ? { ...sheet, allowanceSnapshot: snapshot }
          : sheet
      ),
    }));
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setState(prev => ({
      ...prev,
      uiSettings: { ...prev.uiSettings, theme },
    }));
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const toggleTheme = (origin?: { x: number; y: number }) => {
    setThemeTransitionId(prev => prev + 1);
    if (origin) {
      const root = document.documentElement;
      root.style.setProperty('--spotlight-x', `${origin.x}px`);
      root.style.setProperty('--spotlight-y', `${origin.y}px`);
    }
    const nextTheme = state.uiSettings.theme === 'dark' ? 'light' : 'dark';
    window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        uiSettings: { ...prev.uiSettings, theme: nextTheme },
      }));
    }, 520);
  };

  const setLanguage = (language: 'en' | 'vi') => {
    setState(prev => ({
      ...prev,
      uiSettings: { ...prev.uiSettings, language },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        ...getCurrentSheet(state),
        currentSheet: getCurrentSheet(state),
        setCurrentSheet,
        addSheet,
        renameSheet,
        removeSheet,
        addIncome,
        removeIncome,
        updateIncome,
        addDebt,
        removeDebt,
        updateDebt,
        addSavings,
        removeSavings,
        updateSavings,
        addBill,
        removeBill,
        updateBill,
        addExpense,
        removeExpense,
        updateExpense,
        addCategory,
        removeCategory,
        updateCategory,
        updatePeriod,
        getTotalIncome,
        getTotalSavings,
        getTotalExpenses,
        getRemainingAmount,
        setDailyAllowanceSnapshot,
        user,
        authLoading,
        dataLoading,
        signIn,
        register,
        signOut,
        themeTransitionId,
        setTheme,
        toggleTheme,
        setLanguage,
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
