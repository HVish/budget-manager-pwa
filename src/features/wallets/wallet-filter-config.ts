import type { WalletType } from '@/api/types';

export type FilterTab = 'all' | 'liquid' | 'loans' | 'investments';

export interface FilterTabConfig {
  id: FilterTab;
  label: string;
  types: WalletType[];
}

export const FILTER_TABS: FilterTabConfig[] = [
  { id: 'all', label: 'All', types: [] },
  { id: 'liquid', label: 'Liquid', types: ['checking', 'savings', 'cash'] },
  { id: 'loans', label: 'Loans', types: ['credit'] },
  { id: 'investments', label: 'Investments', types: ['investment'] },
];
