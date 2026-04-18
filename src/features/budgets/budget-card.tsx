import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { getCategoryMeta, type CategoryMeta } from '@/lib/categories';
import { getProgressColor } from '@/lib/budget';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { BudgetSummaryItem, Currency } from '@/api/types';

interface BudgetCardProps {
  item: BudgetSummaryItem;
  primaryCurrency: Currency;
  categoryMetaMap?: Record<string, CategoryMeta>;
}

export function BudgetCard({ item, primaryCurrency, categoryMetaMap }: BudgetCardProps) {
  const navigate = useAppNavigate();

  const meta = categoryMetaMap?.[item.category] ?? getCategoryMeta(item.category);
  const Icon = meta.icon;

  const pct = Math.round(item.percentageConsumed);
  const fillPct = Math.min(pct, 100);
  const remaining = item.limitAmount - item.spentAmount;
  const isOverBudget = remaining < 0;
  const hasId = !!item.id;

  return (
    <Card
      className={cn(
        'bg-wallet-card gap-0 py-0',
        hasId &&
          'hover:bg-accent/50 focus-visible:ring-ring cursor-pointer transition-all duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]',
      )}
      role={hasId ? 'article' : undefined}
      tabIndex={hasId ? 0 : undefined}
      aria-label={hasId ? `${meta.label} budget, ${pct}% used` : undefined}
      onClick={() => hasId && navigate(`/budgets/${item.id}/transactions`)}
      onKeyDown={(e) => {
        if (hasId && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          navigate(`/budgets/${item.id}/transactions`);
        }
      }}
    >
      <CardContent className="p-4">
        {/* Top row: icon + category info + edit */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                meta.color,
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-medium">{meta.label}</p>
              <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                <span className="text-foreground font-medium">
                  {formatCurrency(item.spentAmount, primaryCurrency)}
                </span>{' '}
                / {formatCurrency(item.limitAmount, primaryCurrency)}
              </p>
            </div>
          </div>
          {hasId && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/budgets/${item.id}/edit`);
              }}
              aria-label={`Edit ${meta.label} budget`}
            >
              <Pencil className="text-muted-foreground h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Progress bar + remaining + percentage */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <p
              className={cn(
                'text-xs tabular-nums',
                isOverBudget ? 'text-destructive font-medium' : 'text-primary',
              )}
            >
              {isOverBudget
                ? `${formatCurrency(Math.abs(remaining), primaryCurrency)} Over`
                : `${formatCurrency(remaining, primaryCurrency)} Left`}
            </p>
            <p
              className={cn(
                'shrink-0 text-xs tabular-nums',
                pct >= 90 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {pct}%
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${meta.label} budget progress`}
            className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
          >
            <div
              className={cn('h-full rounded-full transition-[width]', getProgressColor(pct))}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
