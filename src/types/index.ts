export interface IncomeItem {
  id: string;
  description: string;
  expected: number;
  amount: number;
}

export interface DebtItem {
  id: string;
  description: string;
  dueDate: string;
  budget: number;
  paid: number;
}

export interface BillItem {
  id: string;
  checked: boolean;
  description: string;
  dueDate: string;
  budget: number;
  actual: number;
}

export interface ExpenseItem {
  id: string;
  category: string;
  budget: number;
  actual: number;
}

export interface SavingsItem {
  id: string;
  description: string;
  budget: number;
  actual: number;
}

export interface ExpenseTrackerItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface BudgetData {
  income: IncomeItem[];
  debts: DebtItem[];
  bills: BillItem[];
  expenses: ExpenseItem[];
  savings: SavingsItem[];
  expenseTracker: ExpenseTrackerItem[];
  settings: {
    currency: string;
    startDate: string;
    endDate: string;
    startBalance: number;
  };
}

export const EXPENSE_CATEGORIES = [
  'Entertainment',
  'Food',
  'Em',
  'Education',
  'Fuel',
  'Personal Care',
  'Tiết kiệm',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
