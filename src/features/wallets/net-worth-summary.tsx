import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrencyCompact } from '@/lib/currency';
import type { Currency } from '@/api/types';

// ---------------------------------------------------------------------------
// ChangeBadge — exported for future use in the dashboard NetWorthCard.
// Not rendered yet because the API does not provide month-over-month data.
// ---------------------------------------------------------------------------

interface ChangeBadgeProps {
  changePercent: number;
}

export function ChangeBadge({ changePercent }: ChangeBadgeProps) {
  const isPositive = changePercent > 0;
  const isNeutral = changePercent === 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
        isNeutral && 'bg-muted text-muted-foreground',
        isPositive && 'bg-income/15 text-income',
        !isPositive && !isNeutral && 'bg-expense/15 text-expense',
      )}
    >
      {isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span className="text-xs font-semibold">
        {isPositive ? '+' : ''}
        {Math.abs(changePercent).toFixed(1)}%
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// NetWorthSummary
// ---------------------------------------------------------------------------

interface NetWorthSummaryProps {
  netWorth: number;
  currency: Currency;
  conversionAvailable: boolean;
  // Future: changePercent?: number
}

export function NetWorthSummary({ netWorth, currency, conversionAvailable }: NetWorthSummaryProps) {
  return (
    <section aria-label="Net worth summary" className="px-4 pb-4 lg:px-0">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Total Net Worth
        </p>
        <div className="flex items-center gap-3">
          {conversionAvailable ? (
            <p className="text-foreground text-3xl font-bold tracking-tight">
              {formatCurrencyCompact(netWorth, currency)}
            </p>
          ) : (
            <p className="text-muted-foreground text-3xl font-bold tracking-tight">---</p>
          )}
          {/* ChangeBadge will be rendered here when API provides changePercent */}
        </div>
      </div>
    </section>
  );
}
