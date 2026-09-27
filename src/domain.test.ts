import { describe, expect, it } from 'vitest';
import { cloneCategoriesForNewSheet, getAllowances, getSheetTotals, reconcileCategories } from './domain';
import type { Sheet } from './types';

const makeSheet = (): Sheet => ({
  id: 'sheet-1',
  name: 'T9/2026',
  periodSettings: { startDate: '2026-09-01', endDate: '2026-09-30' },
  expenseRowCount: 50,
  income: [{ id: 'income-1', description: 'Salary', amount: 20_000_000 }],
  debts: [{ id: 'debt-1', description: 'Loan', amount: 1_000_000, date: '2026-09-05' }],
  savings: [{ id: 'saving-1', description: 'Emergency fund', amount: 2_000_000 }],
  bills: [{ id: 'bill-1', description: 'Internet', amount: 500_000, date: '2026-09-10' }],
  expenses: [
    { id: 'expense-1', date: '2026-09-01', description: 'Lunch', amount: 100_000, category: 'Food' },
    { id: 'expense-2', date: '2026-09-02', description: 'Dinner', amount: 200_000, category: 'Food', categoryId: 'food' },
  ],
  categories: [
    { id: 'food', name: 'Food', total: 999_999 },
    { id: 'other', name: 'Others', total: 123 },
  ],
});

describe('financial calculations', () => {
  it('calculates remaining money from every financial bucket', () => {
    expect(getSheetTotals(makeSheet())).toEqual({
      income: 20_000_000,
      savings: 2_000_000,
      expenses: 300_000,
      debts: 1_000_000,
      bills: 500_000,
      remaining: 16_200_000,
    });
  });

  it('locks today allowance to its snapshot and previews tomorrow from live money', () => {
    expect(getAllowances(900_000, 3, 250_000)).toEqual({
      daily: 250_000,
      nextDay: 450_000,
      roundedComputedDaily: 300_000,
    });
  });
});

describe('category reconciliation', () => {
  it('migrates legacy category names to ids and derives totals from expenses', () => {
    const sheet = reconcileCategories(makeSheet());
    expect(sheet.expenses[0].categoryId).toBe('food');
    expect(sheet.categories.find(category => category.id === 'food')?.total).toBe(300_000);
    expect(sheet.categories.find(category => category.id === 'other')?.total).toBe(0);
  });

  it('imports category names into a new sheet without old ids or totals', () => {
    let nextId = 0;
    const categories = cloneCategoriesForNewSheet(makeSheet().categories, () => `new-${++nextId}`);
    expect(categories).toEqual([
      { id: 'new-1', name: 'Food', total: 0 },
      { id: 'new-2', name: 'Others', total: 0 },
    ]);
  });
});
