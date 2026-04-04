import type { WalletType, Currency } from '@/api/types';

export const walletTypes: { value: WalletType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
];

export const currencies: { value: Currency; label: string }[] = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'CAD', label: 'CAD ($)' },
];

/** Shared className for tall form inputs (h-14, rounded-xl).
 *  The data-[size=default] override is needed for SelectTrigger which has
 *  data-[size=default]:h-8 in its base classes with higher CSS specificity. */
export const inputClassName =
  'h-14 data-[size=default]:h-14 rounded-xl px-4 text-base dark:bg-card border-input' as const;
