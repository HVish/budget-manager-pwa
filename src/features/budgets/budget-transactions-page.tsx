import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionDateGroup } from '@/features/transactions/transaction-date-group';
import { groupTransactionsByDate } from '@/features/transactions/group-by-date';
import { DeleteBudgetDialog } from './delete-budget-dialog';
import { useBudgetSummary } from '@/api/hooks/use-budgets';
import { useTransactions } from '@/api/hooks/use-transactions';
import { useWallets } from '@/api/hooks/use-wallets';
import { useCategories } from '@/api/hooks/use-categories';
import { useMonthStore, useMonthRange } from '@/stores/month-store';
import { formatCurrency } from '@/lib/currency';
import { formatMonthYear } from '@/lib/date';
import { getCategoryMeta, buildCategoryMetaMap } from '@/lib/categories';
import { getProgressColor } from '@/lib/budget';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export default function BudgetTransactionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppNavigate();
  const { year, month } = useMonthStore();
  const { startDate, endDate } = useMonthRange();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Use the month-scoped summary so spent/percentage match the selected month
  const { data: summary, isLoading, isError } = useBudgetSummary(year, month);
  const budget = useMemo(
    () => summary?.budgets.find((b) => b.id === id),
    [summary, id],
  );
  const primaryCurrency = summary?.primaryCurrency;

  // Transactions for this budget's category in the selected month
  const txQuery = useTransactions({
    category: budget?.category,
    startDate,
    endDate,
    limit: 50,
    enabled: !!budget,
  });

  const allTransactions = useMemo(
    () => txQuery.data?.pages.flatMap((p) => p.transactions) ?? [],
    [txQuery.data],
  );

  const dateGroups = useMemo(
    () => groupTransactionsByDate(allTransactions),
    [allTransactions],
  );

  // Wallet name lookup
  const walletsQuery = useWallets();
  const walletMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const w of walletsQuery.data ?? []) {
      map[w.id] = w.name;
    }
    return map;
  }, [walletsQuery.data]);

  // Category display name lookup
  const categoriesQuery = useCategories();
  const categoryMetaMap = useMemo(
    () => buildCategoryMetaMap(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-[max(env(safe-area-inset-top),16px)]">
        <div className="flex items-center gap-2 pt-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1" />
        </div>
        <div className="flex flex-col items-center gap-2 py-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !budget || !primaryCurrency) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
        <p className="text-destructive text-sm">Budget not found</p>
        <Button variant="link" className="min-h-11" onClick={() => navigate('/budgets')}>
          Back to budgets
        </Button>
      </div>
    );
  }

  const meta = categoryMetaMap[budget.category] ?? getCategoryMeta(budget.category);
  const Icon = meta.icon;
  const pct = Math.round(budget.percentageConsumed);
  const fillPct = Math.min(pct, 100);
  const remaining = budget.limitAmount - budget.spentAmount;
  const isOverBudget = remaining < 0;
  const monthLabel = formatMonthYear(year, month);

  const categoryLabel = meta.label;

  return (
    <>
      <div className="pb-[max(env(safe-area-inset-bottom),24px)]">
        {/* Header */}
        <PageHeaderBar title="Budget" onBack={() => navigate('/budgets')}>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            onClick={() => navigate(`/budgets/${id}/edit`)}
            aria-label="Edit budget"
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive min-h-11 min-w-11"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete budget"
          >
            <Trash2 />
          </Button>
        </PageHeaderBar>

        {/* Info banner */}
        <div className="px-4 pt-3">
          <div className="bg-card ring-foreground/10 flex items-center gap-2 rounded-xl px-3 py-2 ring-1">
            <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
            <p className="text-muted-foreground text-xs">
              Viewing data for <span className="text-foreground font-medium">{monthLabel}</span>
            </p>
          </div>
        </div>

        {/* Budget hero */}
        <div className="flex flex-col items-center px-4 pt-6 pb-4">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full',
              meta.color,
            )}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-foreground mt-3 text-xl font-bold">{meta.label}</h2>
          <p className="text-muted-foreground mt-1 text-sm tabular-nums">
            <span className="text-foreground font-medium">
              {formatCurrency(budget.spentAmount, primaryCurrency)}
            </span>{' '}
            / {formatCurrency(budget.limitAmount, primaryCurrency)}
          </p>

          {/* Progress bar */}
          <div className="mt-3 w-full max-w-xs">
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
        </div>

        {/* Transactions section */}
        <div className="px-4 pt-6">
          <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
            Transactions
          </h2>

          {txQuery.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          )}

          {!txQuery.isLoading && dateGroups.length === 0 && (
            <div className="bg-card ring-foreground/10 rounded-xl py-8 text-center ring-1">
              <p className="text-muted-foreground text-sm">No transactions this month</p>
            </div>
          )}

          <div className="space-y-4">
            {dateGroups.map((group) => (
              <TransactionDateGroup
                key={group.date}
                date={group.date}
                transactions={group.transactions}
                dailyNet={group.dailyNet}
                currency={group.currency ?? primaryCurrency}
                walletMap={walletMap}
                categoryMetaMap={categoryMetaMap}
              />
            ))}
          </div>

          {/* Load more */}
          {txQuery.hasNextPage && (
            <div className="pt-2 pb-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={() => txQuery.fetchNextPage()}
                disabled={txQuery.isFetchingNextPage}
              >
                {txQuery.isFetchingNextPage ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <DeleteBudgetDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        budgetId={budget.id}
        categoryLabel={categoryLabel}
        onDeleted={() => navigate('/budgets', { replace: true })}
      />
    </>
  );
}
