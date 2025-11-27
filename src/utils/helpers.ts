import { BudgetData } from '../types';

const STORAGE_KEY = 'trackly-budget-data';

export const getInitialData = (): BudgetData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved data:', e);
    }
  }
  
  return {
    income: [
      {
        id: '1',
        description: 'Lương tháng 10',
        amount: 10000000
      }
    ],
    debts: [],
    bills: [
      { id: '1', checked: false, description: 'Tiền điện', dueDate: '', amount: 0 },
      { id: '2', checked: false, description: 'Tiền nước', dueDate: '', amount: 0 }
    ],
    savings: [
      { id: '1', description: 'Tiết kiệm', amount: 3000000 }
    ],
    expenseTracker: [
      { id: '1', date: 'Wed, Nov 5', amount: 300000, description: 'Tiền ăn tiệc anh An', category: 'Entertainment' },
      { id: '2', date: 'Wed, Nov 5', amount: 170000, description: 'Boc', category: 'Entertainment' },
      { id: '3', date: 'Wed, Nov 5', amount: 82000, description: 'Ăn trưa', category: 'Food' },
      { id: '4', date: 'Wed, Nov 5', amount: 160000, description: 'KS', category: 'Entertainment' },
      { id: '5', date: 'Wed, Nov 5', amount: 50000, description: 'Ăn tối', category: 'Food' },
      { id: '6', date: 'Thu, Nov 6', amount: 600000, description: 'Cho Em', category: 'Em' },
      { id: '7', date: 'Thu, Nov 6', amount: 45000, description: 'Ăn trưa', category: 'Food' },
      { id: '8', date: 'Thu, Nov 6', amount: 20000, description: 'Nước dừa cho Em', category: 'Em' },
      { id: '9', date: 'Fri, Nov 7', amount: 47000, description: 'Ăn trưa', category: 'Food' },
      { id: '10', date: 'Fri, Nov 7', amount: 61000, description: 'Đồ ăn cho Em', category: 'Em' },
      { id: '11', date: 'Fri, Nov 7', amount: 50000, description: 'Ăn tối', category: 'Food' },
      { id: '12', date: 'Sat, Nov 8', amount: 283000, description: 'Mỹ phẩm cho Em', category: 'Em' }
    ],
    categories: [
      { id: '1', name: 'Entertainment', color: '#f59e0b' },
      { id: '2', name: 'Food', color: '#10b981' },
      { id: '3', name: 'Em', color: '#ec4899' },
      { id: '4', name: 'Education', color: '#3b82f6' },
      { id: '5', name: 'Fuel', color: '#8b5cf6' },
      { id: '6', name: 'Personal Care', color: '#06b6d4' },
      { id: '7', name: 'Tiết kiệm', color: '#14b8a6' },
      { id: '8', name: 'Other', color: '#6b7280' }
    ],
    settings: {
      currency: '₫',
      startDate: '2025-11-05',
      endDate: '2025-12-05',
      startBalance: 0,
      darkMode: false
    }
  };
};

export const saveData = (data: BudgetData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

export const formatCurrency = (amount: number, _currency?: string): string => {
  return `${amount.toLocaleString('vi-VN')}`;
};

export const parseMoneyValue = (text: string): number => {
  const cleaned = text.replace(/[₫$€,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

export const calculateDaysBetween = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
