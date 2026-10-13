export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  note?: string;
}

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export interface CategoryExpenseAnalytics {
  categoryId: string;
  categoryName: string;
  color: string;
  total: number;
  percentage?: number;
}

export type PeriodKey = 'current_month' | 'prev_month' | 'all';

export interface PeriodOption {
  key: PeriodKey;
  label: string;
  from?: string;
  to?: string;
}
