import type { Category, ExpenseItem, Sheet } from './types';

export const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const findExpenseCategory = (expense: ExpenseItem, categories: Category[]) => {
  return categories.find(category => category.id === expense.categoryId)
    ?? categories.find(category => category.name === expense.category);
};

export const reconcileCategories = (sheet: Sheet): Sheet => {
  const categories = sheet.categories.map(category => ({ ...category, total: 0 }));
  const expenses = sheet.expenses.map(expense => {
    const category = findExpenseCategory(expense, categories);
    if (!category) return { ...expense, amount: toNumber(expense.amount), categoryId: undefined };
    category.total += toNumber(expense.amount);
    return {
      ...expense,
      amount: toNumber(expense.amount),
      categoryId: category.id,
      category: category.name,
    };
  });

  return { ...sheet, expenses, categories };
};

export const cloneCategoriesForNewSheet = (categories: Category[], createId: () => string): Category[] => {
  return categories.map(category => ({
    id: createId(),
    name: category.name,
    total: 0,
  }));
};

export const getSheetTotals = (sheet: Sheet) => {
  const income = sheet.income.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const savings = sheet.savings.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const expenses = sheet.expenses.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const debts = sheet.debts.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const bills = sheet.bills.reduce((sum, item) => sum + toNumber(item.amount), 0);

  return {
    income,
    savings,
    expenses,
    debts,
    bills,
    remaining: income - savings - expenses - debts - bills,
  };
};

export const getAllowances = (remaining: number, daysRemaining: number, snapshotAmount?: number) => {
  const computedDaily = daysRemaining > 0 ? remaining / daysRemaining : 0;
  const roundedComputedDaily = Math.round(computedDaily);
  const roundedSnapshot = snapshotAmount === undefined ? undefined : Math.round(snapshotAmount);
  const daily = roundedSnapshot !== undefined && roundedSnapshot !== 0
    ? roundedSnapshot
    : roundedComputedDaily;
  const nextDay = daysRemaining > 1 ? remaining / (daysRemaining - 1) : 0;

  return { daily, nextDay, roundedComputedDaily };
};
