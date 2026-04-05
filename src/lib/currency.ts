import {
  IndianRupee,
  DollarSign,
  Euro,
  PoundSterling,
  JapaneseYen,
  type LucideIcon,
} from 'lucide-react';
import type { Currency } from '@/api/types';

const currencyIconMap: Record<Currency, LucideIcon> = {
  INR: IndianRupee,
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
  JPY: JapaneseYen,
  AUD: DollarSign,
  CAD: DollarSign,
};

/** Returns the Lucide icon component for a given currency code. */
export function getCurrencyIcon(currency: Currency): LucideIcon {
  return currencyIconMap[currency] ?? IndianRupee;
}

const currencySymbolMap: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: '$',
  CAD: '$',
};

/** Returns the currency symbol character for a given currency code. */
export function getCurrencySymbol(currency: Currency): string {
  return currencySymbolMap[currency] ?? '₹';
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  if (!formatterCache.has(currency)) {
    formatterCache.set(
      currency,
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }),
    );
  }
  return formatterCache.get(currency)!;
}

/** Format minor units (cents/paise) to display string. e.g. -500000, "INR" → "-₹5,000.00" */
export function formatCurrency(amountInMinorUnits: number, currency: string): string {
  return getFormatter(currency).format(amountInMinorUnits / 100);
}

/** Format without currency symbol, for inputs. e.g. 500000 → "5000.00" */
export function formatAmount(amountInMinorUnits: number): string {
  return (amountInMinorUnits / 100).toFixed(2);
}

/** Parse display amount to minor units. e.g. "5000.00" → 500000. Returns 0 for empty/invalid input. */
export function parseAmount(displayAmount: string): number {
  const parsed = parseFloat(displayAmount);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

const compactFormatterCache = new Map<string, Intl.NumberFormat>();

function getCompactFormatter(currency: string): Intl.NumberFormat {
  if (!compactFormatterCache.has(currency)) {
    compactFormatterCache.set(
      currency,
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    );
  }
  return compactFormatterCache.get(currency)!;
}

/** Format minor units to display string without decimals. e.g. 12450000, "INR" → "₹1,24,500" */
export function formatCurrencyCompact(amountInMinorUnits: number, currency: string): string {
  return getCompactFormatter(currency).format(amountInMinorUnits / 100);
}

/** Mask all but last 4 characters. e.g. "123456784521" → "····4521" */
export function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4);
  return `····${last4}`;
}
