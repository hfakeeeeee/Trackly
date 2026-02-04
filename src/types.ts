// Type definitions for the expense tracker application

export interface IncomeItem {
  id: string;
  description: string;
  amount: number;
}

export interface DebtItem {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface SavingsItem {
  id: string;
  description: string;
  amount: number;
}

export interface BillItem {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  total: number;
}

export interface PeriodSettings {
  startDate: string;
  endDate: string;
}

export interface AllowanceSnapshot {
  date: string;
  amount: number;
}

export interface AppState {
  sheets: Sheet[];
  currentSheetId: string;
  uiSettings: {
    theme: 'light' | 'dark';
    language: 'en' | 'vi';
  };
}

export interface Sheet {
  id: string;
  name: string;
  periodSettings: PeriodSettings;
  income: IncomeItem[];
  debts: DebtItem[];
  savings: SavingsItem[];
  bills: BillItem[];
  expenses: ExpenseItem[];
  categories: Category[];
  allowanceSnapshot?: AllowanceSnapshot;
}
