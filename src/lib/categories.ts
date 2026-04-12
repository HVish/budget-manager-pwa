import {
  Receipt,
  Car,
  Home,
  ShoppingBag,
  Zap,
  Heart,
  Gamepad2,
  Briefcase,
  TrendingUp,
  Banknote,
  HelpCircle,
  CreditCard,
  ArrowLeftRight,
  Wrench,
  Pizza,
  Tag,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/api/types';

export interface CategoryMeta {
  icon: LucideIcon;
  color: string;
  label: string;
}

/** Icon + color map for the 17 default categories (16 + OTHER_INCOME). */
const defaultMetaMap: Record<string, CategoryMeta> = {
  SALARY: { icon: Briefcase, color: 'bg-green-700', label: 'Salary' },
  FREELANCE: { icon: Banknote, color: 'bg-lime-700', label: 'Freelance' },
  INVESTMENT: { icon: TrendingUp, color: 'bg-teal-500', label: 'Investment' },
  OTHER_INCOME: { icon: Wallet, color: 'bg-cyan-600', label: 'Other Income' },
  GROCERIES: { icon: ShoppingBag, color: 'bg-orange-700', label: 'Groceries' },
  TRANSPORT: { icon: Car, color: 'bg-blue-500', label: 'Transport' },
  ENTERTAINMENT: { icon: Gamepad2, color: 'bg-purple-500', label: 'Entertainment' },
  SHOPPING: { icon: CreditCard, color: 'bg-pink-500', label: 'Shopping' },
  FOOD: { icon: Pizza, color: 'bg-amber-700', label: 'Food' },
  UTILITIES: { icon: Zap, color: 'bg-yellow-700', label: 'Utilities' },
  HOUSING: { icon: Home, color: 'bg-emerald-500', label: 'Housing' },
  DEBT: { icon: Receipt, color: 'bg-red-600', label: 'Debt' },
  HEALTH: { icon: Heart, color: 'bg-red-500', label: 'Health' },
  OTHER: { icon: HelpCircle, color: 'bg-gray-500', label: 'Other' },
  OTHER_EXPENSE: { icon: HelpCircle, color: 'bg-gray-500', label: 'Other Expense' },
  CORRECTION: { icon: Wrench, color: 'bg-slate-500', label: 'Correction' },
  TRANSFER: { icon: ArrowLeftRight, color: 'bg-indigo-500', label: 'Transfer' },
};

const customIncomeMeta: CategoryMeta = { icon: Tag, color: 'bg-emerald-600', label: '' };
const customExpenseMeta: CategoryMeta = { icon: Tag, color: 'bg-orange-600', label: '' };
const unknownMeta: CategoryMeta = { icon: HelpCircle, color: 'bg-gray-500', label: 'Unknown' };

/**
 * Get icon/color/label for a category by its `name` key.
 * For default categories, returns a hardcoded icon+color.
 * For custom or unknown categories, returns a generic Tag icon with a type-based color.
 * Pass the Category object for best results; falls back to name-only lookup.
 */
export function getCategoryMeta(category: string, apiCategory?: Category): CategoryMeta {
  const known = defaultMetaMap[category];
  if (known) return known;

  // Custom category — use displayName as label, type-based color
  if (apiCategory) {
    const base = apiCategory.type === 'income' ? customIncomeMeta : customExpenseMeta;
    return { ...base, label: apiCategory.displayName };
  }

  return unknownMeta;
}

/**
 * Build a name → CategoryMeta lookup from an array of API categories.
 * Useful for rendering transaction lists without per-row lookups.
 */
export function buildCategoryMetaMap(categories: Category[]): Record<string, CategoryMeta> {
  const map: Record<string, CategoryMeta> = {};
  for (const cat of categories) {
    const known = defaultMetaMap[cat.name];
    if (known) {
      // Use displayName from API (may differ from hardcoded label)
      map[cat.name] = { ...known, label: cat.displayName };
    } else {
      const base = cat.type === 'income' ? customIncomeMeta : customExpenseMeta;
      map[cat.name] = { ...base, label: cat.displayName };
    }
  }
  return map;
}
