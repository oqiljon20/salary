import {
  Category,
  CreateCategoryInput,
  Transaction,
  CreateTransactionInput,
  AnalyticsSummary,
  CategoryExpenseAnalytics,
} from '../types';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Categories
  async getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return request<Category[]>(`/api/categories${query}`);
  },

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Transactions
  async getTransactions(params?: {
    from?: string;
    to?: string;
    type?: 'income' | 'expense';
    categoryId?: string;
  }): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);

    const qs = searchParams.toString();
    return request<Transaction[]>(`/api/transactions${qs ? `?${qs}` : ''}`);
  },

  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    return request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteTransaction(id: string): Promise<{ success: boolean; id: string }> {
    return request<{ success: boolean; id: string }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Analytics
  async getSummary(from?: string, to?: string): Promise<AnalyticsSummary> {
    const searchParams = new URLSearchParams();
    if (from) searchParams.set('from', from);
    if (to) searchParams.set('to', to);

    const qs = searchParams.toString();
    return request<AnalyticsSummary>(`/api/analytics/summary${qs ? `?${qs}` : ''}`);
  },

  async getByCategory(
    from?: string,
    to?: string,
    type: 'income' | 'expense' = 'expense'
  ): Promise<CategoryExpenseAnalytics[]> {
    const searchParams = new URLSearchParams();
    if (from) searchParams.set('from', from);
    if (to) searchParams.set('to', to);
    if (type) searchParams.set('type', type);

    const qs = searchParams.toString();
    return request<CategoryExpenseAnalytics[]>(`/api/analytics/by-category${qs ? `?${qs}` : ''}`);
  },
};
