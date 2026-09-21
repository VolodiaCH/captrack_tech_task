export interface User {
  id: string;
  provider: 'GOOGLE' | 'GITHUB';
  providerUserId: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category: Category;
  title: string;
  amount: string;
  currency: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  hasBudget: boolean;
  budget?: number;
  spent: number;
  remaining?: number;
  usagePct?: number;
  currency?: string;
}

export interface ThresholdAlert {
  threshold: number;
  yearMonth: string;
  spent: number;
  budget: number;
  usagePct: number;
  firedAt: string;
  replay: boolean;
}
