export type TransactionFilterTab = 'all' | 'income' | 'expenses';

export interface TransactionFilterTabConfig {
  id: TransactionFilterTab;
  label: string;
  /** API filter overrides merged into the useTransactions call */
  filters: { minAmount?: number; maxAmount?: number };
}

export const TRANSACTION_FILTER_TABS: TransactionFilterTabConfig[] = [
  { id: 'all', label: 'All', filters: {} },
  { id: 'income', label: 'Income', filters: { minAmount: 1 } },
  { id: 'expenses', label: 'Expenses', filters: { maxAmount: -1 } },
];
