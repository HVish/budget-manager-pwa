import { Landmark, PiggyBank, Banknote, CreditCard, TrendingUp, HandCoins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WalletType, Wallet } from '@/api/types';
import { maskAccountNumber } from '@/lib/currency';

/** Returns "Current" for non-US English locales, "Checking" otherwise. */
export function getCheckingLabel(): string {
  const lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  // US English uses "Checking", most other English locales use "Current"
  if (lang.startsWith('en') && !lang.startsWith('en-US')) return 'Current';
  return 'Checking';
}

export interface WalletTypeConfig {
  icon: LucideIcon;
  label: string;
  groupLabel: string;
  balanceLabel: string;
  iconBg: string;
  iconColor: string;
}

const checkingLabel = getCheckingLabel();

export const walletTypeConfig: Record<WalletType, WalletTypeConfig> = {
  checking: {
    icon: Landmark,
    label: checkingLabel,
    groupLabel: checkingLabel,
    balanceLabel: 'Available Balance',
    iconBg: 'bg-chart-1/15',
    iconColor: 'text-chart-1',
  },
  savings: {
    icon: PiggyBank,
    label: 'Savings',
    groupLabel: 'Savings',
    balanceLabel: 'Total Savings',
    iconBg: 'bg-income/15',
    iconColor: 'text-income',
  },
  cash: {
    icon: Banknote,
    label: 'Cash',
    groupLabel: 'Cash',
    balanceLabel: 'Cash on Hand',
    iconBg: 'bg-chart-2/15',
    iconColor: 'text-chart-2',
  },
  credit: {
    icon: CreditCard,
    label: 'Credit',
    groupLabel: 'Credit & Loans',
    balanceLabel: 'Outstanding Balance',
    iconBg: 'bg-expense/15',
    iconColor: 'text-expense',
  },
  investment: {
    icon: TrendingUp,
    label: 'Investments',
    groupLabel: 'Investments',
    balanceLabel: 'Current Value',
    iconBg: 'bg-chart-3/15',
    iconColor: 'text-chart-3',
  },
  loan: {
    icon: HandCoins,
    label: 'Loan',
    groupLabel: 'Loans',
    balanceLabel: 'Outstanding Balance',
    iconBg: 'bg-chart-2/15',
    iconColor: 'text-chart-2',
  },
};

/** Ordered list of wallet types for consistent group rendering. */
export const WALLET_TYPE_ORDER: WalletType[] = [
  'checking',
  'savings',
  'cash',
  'investment',
  'credit',
  'loan',
];

/** Build the subtitle line shown below the wallet name on a card. */
export function getWalletSubtitle(wallet: Wallet): string {
  const config = walletTypeConfig[wallet.walletType];
  const typeLabel = config?.label ?? 'Account';
  if (wallet.accountNumber) {
    return `${typeLabel} · ${maskAccountNumber(wallet.accountNumber)}`;
  }
  return typeLabel;
}
