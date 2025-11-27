export interface IncomeItem {
  id: string;
  description: string;
  amount: number;
}

export interface DebtItem {
  id: string;
  description: string;
  dueDate: string;
  amount: number;
}

export interface BillItem {
  id: string;
  checked: boolean;
  description: string;
  dueDate: string;
  amount: number;
}

export interface SavingsItem {
  id: string;
  description: string;
  amount: number;
}

export interface ExpenseTrackerItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface BudgetData {
  income: IncomeItem[];
  debts: DebtItem[];
  bills: BillItem[];
  savings: SavingsItem[];
  expenseTracker: ExpenseTrackerItem[];
  categories: Category[];
  settings: {
    currency: string;
    startDate: string;
    endDate: string;
    startBalance: number;
    darkMode: boolean;
  };
}
