// ── Currency ─────────────────────────────────────────────────────────────────

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';

// ── Wallets ─────────────────────────────────────────────────────────────────

export type WalletType = 'checking' | 'savings' | 'cash' | 'credit' | 'investment' | 'loan';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: Currency;
  walletType: WalletType;
  accountNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletCreate {
  name: string;
  balance?: number;
  currency?: Currency;
  walletType?: WalletType;
  accountNumber?: string;
}

export interface WalletUpdate {
  name?: string;
  balance?: number;
  currency?: Currency;
  accountNumber?: string;
}

export interface BalanceHistoryEntry {
  date: string;
  balance: number;
}

// ── Categories ──────────────────────────────────────────────────────────────

export type CategoryType = 'income' | 'expense';
export type CategorySource = 'default' | 'custom';

export interface Category {
  id: string;
  name: string;
  displayName: string;
  type: CategoryType;
  isSystem: boolean;
  source: CategorySource;
  usageCount: number;
}

export interface CategoryCreate {
  displayName: string;
  type: CategoryType;
}

export interface CategoryUpdate {
  displayName: string;
}

// ── Transactions ────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  walletId: string;
  title: string;
  category: string;
  tags?: string[];
  amount: number; // signed int64 minor units (negative=debit, positive=credit)
  currency: Currency;
  transactionDate: string;
  transferId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCreate {
  walletId: string;
  title: string;
  category: string;
  tags?: string[];
  amount: number;
  transactionDate: string;
  notes?: string;
}

export interface TransactionUpdate {
  title?: string;
  category?: string;
  tags?: string[];
  amount?: number;
  transactionDate?: string;
  notes?: string;
}

export interface CursorPagination {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: CursorPagination;
}

// ── Transfers ───────────────────────────────────────────────────────────────

export interface TransferCreate {
  fromWalletId: string;
  toWalletId: string;
  fromAmount: number;
  toAmount: number;
  transactionDate: string;
  title?: string;
  notes?: string | null;
  tags?: string[] | null;
}

export interface Transfer {
  transferId: string;
  debitTransaction: Transaction;
  creditTransaction: Transaction;
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export interface MonthlyCurrencySummary {
  currency: Currency;
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
}

export interface DashboardTransaction {
  id: string;
  walletId: string;
  title: string;
  category: string;
  amount: number;
  currency: Currency;
  transactionDate: string;
  transferId?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
}

export interface DashboardResponse {
  year: number;
  month: number;
  primaryCurrency: Currency;
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
  conversionAvailable: boolean;
  conversionRateDate?: string;
  summaries: MonthlyCurrencySummary[];
  recentTransactions: DashboardTransaction[];
}

// ── Budgets ─────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  currency: Currency;
  spentAmount: number;
  percentageConsumed: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCreate {
  category: string;
  limitAmount: number;
  currency: Currency;
}

export interface BudgetUpdate {
  limitAmount?: number;
  currency?: Currency;
}

export interface BudgetSummaryItem {
  id: string;
  category: string;
  limitAmount: number;
  spentAmount: number;
  percentageConsumed: number;
  originalCurrency: Currency;
  originalLimit: number;
}

export interface BudgetSummaryResponse {
  year: number;
  month: number;
  primaryCurrency: Currency;
  totalLimit: number;
  totalSpent: number;
  percentageConsumed: number;
  conversionAvailable: boolean;
  conversionRateDate?: string;
  budgets: BudgetSummaryItem[];
}

// ── User Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  email: string;
  name?: string | null;
  currency: Currency;
  timezone: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string | null;
  email?: string;
  currency?: Currency;
  timezone?: string;
}

// ── Errors ──────────────────────────────────────────────────────────────────

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  'invalid-params'?: Array<{
    name: string;
    reason: string;
    value?: unknown;
  }>;
}
