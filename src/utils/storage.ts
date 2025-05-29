
import { ExpenseType, MonetaryFund, Budget, ExpenseHeader, ExpenseDetail, Deposit, User } from '@/types/expense';

const STORAGE_KEYS = {
  USERS: 'expense_users',
  EXPENSE_TYPES: 'expense_types',
  MONETARY_FUNDS: 'monetary_funds',
  BUDGETS: 'budgets',
  EXPENSE_HEADERS: 'expense_headers',
  EXPENSE_DETAILS: 'expense_details',
  DEPOSITS: 'deposits',
  CURRENT_USER: 'current_user'
};

// Initialize default data
const initializeData = () => {
  // Initialize users with admin user
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      { id: '1', username: 'admin', password: 'admin' }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // Initialize sample data
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSE_TYPES)) {
    const defaultExpenseTypes: ExpenseType[] = [
      { id: '1', code: '001', name: 'Alimentación', description: 'Gastos en comida y bebidas', createdAt: new Date() },
      { id: '2', code: '002', name: 'Transporte', description: 'Gastos en movilización', createdAt: new Date() },
      { id: '3', code: '003', name: 'Entretenimiento', description: 'Gastos en recreación', createdAt: new Date() }
    ];
    localStorage.setItem(STORAGE_KEYS.EXPENSE_TYPES, JSON.stringify(defaultExpenseTypes));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MONETARY_FUNDS)) {
    const defaultFunds: MonetaryFund[] = [
      { id: '1', name: 'Cuenta Corriente', type: 'bank', balance: 5000, createdAt: new Date() },
      { id: '2', name: 'Caja Chica', type: 'cash', balance: 500, createdAt: new Date() }
    ];
    localStorage.setItem(STORAGE_KEYS.MONETARY_FUNDS, JSON.stringify(defaultFunds));
  }
};

export const storage = {
  init: initializeData,
  
  // Users
  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Expense Types
  getExpenseTypes: (): ExpenseType[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSE_TYPES) || '[]'),
  saveExpenseTypes: (expenseTypes: ExpenseType[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSE_TYPES, JSON.stringify(expenseTypes));
  },
  
  // Monetary Funds
  getMonetaryFunds: (): MonetaryFund[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.MONETARY_FUNDS) || '[]'),
  saveMonetaryFunds: (funds: MonetaryFund[]) => {
    localStorage.setItem(STORAGE_KEYS.MONETARY_FUNDS, JSON.stringify(funds));
  },
  
  // Budgets
  getBudgets: (): Budget[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]'),
  saveBudgets: (budgets: Budget[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },
  
  // Expense Headers
  getExpenseHeaders: (): ExpenseHeader[] => {
    const headers = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSE_HEADERS) || '[]');
    return headers.map((h: any) => ({ ...h, date: new Date(h.date), createdAt: new Date(h.createdAt) }));
  },
  saveExpenseHeaders: (headers: ExpenseHeader[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSE_HEADERS, JSON.stringify(headers));
  },
  
  // Expense Details
  getExpenseDetails: (): ExpenseDetail[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSE_DETAILS) || '[]'),
  saveExpenseDetails: (details: ExpenseDetail[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSE_DETAILS, JSON.stringify(details));
  },
  
  // Deposits
  getDeposits: (): Deposit[] => {
    const deposits = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPOSITS) || '[]');
    return deposits.map((d: any) => ({ ...d, date: new Date(d.date), createdAt: new Date(d.createdAt) }));
  },
  saveDeposits: (deposits: Deposit[]) => {
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
  }
};
