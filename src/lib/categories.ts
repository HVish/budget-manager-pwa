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
  type LucideIcon,
} from 'lucide-react';
import type { TransactionCategory } from '@/api/types';

interface CategoryMeta {
  icon: LucideIcon;
  color: string;
  label: string;
}

const categoryMap: Record<TransactionCategory, CategoryMeta> = {
  SALARY: { icon: Briefcase, color: 'bg-green-700', label: 'Salary' },
  FREELANCE: { icon: Banknote, color: 'bg-lime-700', label: 'Freelance' },
  INVESTMENT: { icon: TrendingUp, color: 'bg-teal-500', label: 'Investment' },
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
  CORRECTION: { icon: Wrench, color: 'bg-slate-500', label: 'Correction' },
  TRANSFER: { icon: ArrowLeftRight, color: 'bg-indigo-500', label: 'Transfer' },
};

const defaultMeta: CategoryMeta = { icon: HelpCircle, color: 'bg-gray-500', label: 'Unknown' };

export function getCategoryMeta(category: string): CategoryMeta {
  return categoryMap[category as TransactionCategory] ?? defaultMeta;
}

export const incomeCategories: TransactionCategory[] = ['SALARY', 'FREELANCE', 'INVESTMENT'];

export const expenseCategories: TransactionCategory[] = [
  'GROCERIES',
  'TRANSPORT',
  'ENTERTAINMENT',
  'SHOPPING',
  'FOOD',
  'UTILITIES',
  'HOUSING',
  'DEBT',
  'HEALTH',
  'OTHER',
];

/** Categories that can have a budget — expense categories only. */
export const allBudgetableCategories: TransactionCategory[] = [...expenseCategories];
