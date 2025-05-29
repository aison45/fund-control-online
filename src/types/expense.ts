
export interface ExpenseType {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface MonetaryFund {
  id: string;
  name: string;
  type: 'bank' | 'cash';
  balance: number;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  expenseTypeId: string;
  month: string; // YYYY-MM format
  budgetAmount: number;
  spentAmount: number;
  createdAt: Date;
}

export interface ExpenseHeader {
  id: string;
  date: Date;
  monetaryFundId: string;
  observations: string;
  commerceName: string;
  documentType: 'receipt' | 'invoice' | 'other';
  total: number;
  createdAt: Date;
}

export interface ExpenseDetail {
  id: string;
  expenseHeaderId: string;
  expenseTypeId: string;
  amount: number;
}

export interface Deposit {
  id: string;
  date: Date;
  monetaryFundId: string;
  amount: number;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  password: string;
}
