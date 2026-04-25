export type TransactionFilterTab = 'all' | 'income' | 'expenses';

export interface TransactionFilterTabConfig {
  id: TransactionFilterTab;
  label: string;
  /** API filter overrides merged into the useTransactions call */
  filters: { type?: 'income' | 'expense' };
}

export const TRANSACTION_FILTER_TABS: TransactionFilterTabConfig[] = [
  { id: 'all', label: 'All', filters: {} },
  { id: 'income', label: 'Income', filters: { type: 'income' } },
  { id: 'expenses', label: 'Expenses', filters: { type: 'expense' } },
];
