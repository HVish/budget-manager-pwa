import type { WalletType, Currency } from '@/api/types';
import { walletTypeConfig } from '@/lib/wallet-types';

export const walletTypes: { value: WalletType; label: string }[] = [
  { value: 'checking', label: walletTypeConfig.checking.label },
  { value: 'savings', label: 'Savings' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
  { value: 'loan', label: 'Loan' },
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

export { inputClassName } from '@/lib/form-constants';
