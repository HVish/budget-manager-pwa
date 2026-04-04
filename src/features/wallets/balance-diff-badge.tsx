import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import type { Currency } from '@/api/types';

interface BalanceDiffBadgeProps {
  currentBalance: number; // Minor units
  newBalance: number; // Minor units
  currency: Currency;
}

export function BalanceDiffBadge({ currentBalance, newBalance, currency }: BalanceDiffBadgeProps) {
  if (newBalance === currentBalance) return null;

  const diff = newBalance - currentBalance;
  const isIncome = diff > 0;

  return (
    <div aria-live="polite">
      <div
        className={cn(
          'animate-in fade-in-0 slide-in-from-top-1 flex items-center justify-between rounded-xl border px-4 py-3 duration-200',
          isIncome ? 'border-income/30 bg-income/15' : 'border-expense/30 bg-expense/15',
        )}
      >
        <div>
          <p className="text-muted-foreground text-sm">This will be recorded as</p>
          <p className={cn('text-base font-semibold', isIncome ? 'text-income' : 'text-expense')}>
            {isIncome ? 'Income' : 'Expense'}
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-base font-semibold',
            isIncome ? 'text-income' : 'text-expense',
          )}
        >
          {isIncome ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {formatCurrency(Math.abs(diff), currency)}
        </div>
      </div>
    </div>
  );
}
