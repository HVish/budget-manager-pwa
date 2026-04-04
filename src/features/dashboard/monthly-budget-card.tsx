import { AppLink } from '@/components/ui/app-link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import { useBudgetSummary } from '@/api/hooks/use-budgets';
import { cn } from '@/lib/utils';

interface MonthlyBudgetCardProps {
  year: number;
  month: number;
}

function getProgressColor(pct: number): string {
  if (pct >= 90) return 'bg-destructive';
  if (pct >= 75) return 'bg-yellow-500';
  return 'bg-primary';
}

export function MonthlyBudgetCard({ year, month }: MonthlyBudgetCardProps) {
  const { data, isLoading, isError } = useBudgetSummary(year, month);

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-xl" />;
  }

  // Silently hide on error — budget is supplementary data
  if (isError || !data) {
    return null;
  }

  // No budgets configured
  if (!data.budgets.length) {
    return (
      <Card>
        <CardContent className="text-muted-foreground p-4 text-center text-sm">
          No budgets configured.{' '}
          <AppLink
            to="/budgets"
            className="text-primary inline-flex min-h-11 items-center font-medium hover:underline"
          >
            Set one up
          </AppLink>
        </CardContent>
      </Card>
    );
  }

  const { percentageConsumed, totalLimit, totalSpent, primaryCurrency, conversionAvailable } = data;

  // Cannot show meaningful budget data without exchange rate conversion
  if (!conversionAvailable) {
    return (
      <Card>
        <CardContent className="text-muted-foreground p-4 text-center text-sm">
          Exchange rates unavailable
        </CardContent>
      </Card>
    );
  }

  const pct = Math.round(percentageConsumed);
  const fillPct = Math.min(pct, 100);
  const remaining = totalLimit - totalSpent;
  const isOverBudget = remaining < 0;

  return (
    <Card>
      <CardContent className="p-4">
        {/* Title row */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-foreground text-sm font-medium">Monthly Budget</p>
          <p
            className={cn(
              'text-sm font-medium',
              pct >= 90 ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {pct}%
          </p>
        </div>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Monthly budget progress"
          className="bg-muted mb-2 h-1.5 w-full overflow-hidden rounded-full"
        >
          <div
            className={cn('h-full rounded-full transition-[width]', getProgressColor(pct))}
            style={{ width: `${fillPct}%` }}
          />
        </div>

        {/* Remaining text */}
        {isOverBudget ? (
          <p className="text-destructive text-xs">
            {formatCurrency(Math.abs(remaining), primaryCurrency)} over budget
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            {formatCurrency(remaining, primaryCurrency)} left to spend
          </p>
        )}
      </CardContent>
    </Card>
  );
}
