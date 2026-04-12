import {
  IndianRupee,
  DollarSign,
  Euro,
  PoundSterling,
  JapaneseYen,
  type LucideIcon,
} from 'lucide-react';
import type { Currency } from '@/api/types';

export const CURRENCY_OPTIONS: { code: Currency; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

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

// ---------------------------------------------------------------------------
// Locale from timezone
// ---------------------------------------------------------------------------

const TIMEZONE_LOCALE_MAP: Record<string, string> = {
  'Asia/Kolkata': 'en-IN',
  'Asia/Calcutta': 'en-IN', // Legacy IANA alias for Asia/Kolkata
  'America/New_York': 'en-US',
  'America/Chicago': 'en-US',
  'America/Denver': 'en-US',
  'America/Los_Angeles': 'en-US',
  'America/Toronto': 'en-CA',
  'America/Vancouver': 'en-CA',
  'Europe/London': 'en-GB',
  'Europe/Paris': 'fr-FR',
  'Europe/Berlin': 'de-DE',
  'Europe/Rome': 'it-IT',
  'Europe/Madrid': 'es-ES',
  'Asia/Tokyo': 'ja-JP',
  'Australia/Sydney': 'en-AU',
  'Australia/Melbourne': 'en-AU',
  'Australia/Perth': 'en-AU',
  'Pacific/Auckland': 'en-NZ',
};

const DEFAULT_LOCALE = 'en-IN';

let _appLocale = DEFAULT_LOCALE;

export function getLocaleFromTimezone(timezone: string): string {
  return TIMEZONE_LOCALE_MAP[timezone] ?? DEFAULT_LOCALE;
}

/** Set the app-wide locale. Returns `true` if the locale actually changed. */
export function setAppLocale(locale: string): boolean {
  if (locale === _appLocale) return false;
  _appLocale = locale;
  formatterCache.clear();
  compactFormatterCache.clear();
  return true;
}

export function getAppLocale(): string {
  return _appLocale;
}

// ---------------------------------------------------------------------------
// Number formatters (locale-aware)
// ---------------------------------------------------------------------------

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  const key = `${_appLocale}:${currency}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(_appLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }),
    );
  }
  return formatterCache.get(key)!;
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
  const key = `${_appLocale}:${currency}`;
  if (!compactFormatterCache.has(key)) {
    compactFormatterCache.set(
      key,
      new Intl.NumberFormat(_appLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    );
  }
  return compactFormatterCache.get(key)!;
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
