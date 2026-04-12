import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useBudgetSummary } from '@/api/hooks/use-budgets';
import { useCategories } from '@/api/hooks/use-categories';
import { buildCategoryMetaMap } from '@/lib/categories';
import { useMonthStore } from '@/stores/month-store';
import { BudgetsSkeleton } from './budgets-skeleton';
import { BudgetEmpty } from './budget-empty';
import { BudgetSummaryCards } from './budget-summary-cards';
import { BudgetCard } from './budget-card';

export default function BudgetsPage() {
  const { year, month } = useMonthStore();
  const { data, isLoading, isError, refetch } = useBudgetSummary(year, month);

  const categoriesQuery = useCategories({ type: 'expense' });
  const categoryMetaMap = useMemo(
    () => buildCategoryMetaMap(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  const sortedBudgets = useMemo(() => {
    if (!data) return [];
    return [...data.budgets].sort((a, b) => b.percentageConsumed - a.percentageConsumed);
  }, [data]);

  if (isLoading) {
    return (
      <div className="pt-[max(env(safe-area-inset-top),16px)]">
        <PageHeader title="Budgets" />
        <BudgetsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-[max(env(safe-area-inset-top),16px)]">
        <PageHeader title="Budgets" />
        <div className="flex flex-col items-center justify-center gap-2 px-4 pt-12 text-center">
          <p role="alert" className="text-destructive text-sm">
            Failed to load budgets
          </p>
          <Button variant="link" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.budgets.length === 0) {
    return (
      <div className="pt-[max(env(safe-area-inset-top),16px)]">
        <PageHeader title="Budgets" />
        <BudgetEmpty />
      </div>
    );
  }

  if (!data.conversionAvailable) {
    return (
      <div className="pt-[max(env(safe-area-inset-top),16px)]">
        <PageHeader title="Budgets" />
        <div className="px-4 pt-12 text-center">
          <p className="text-muted-foreground text-sm">Exchange rates unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[max(env(safe-area-inset-top),16px)]">
      <PageHeader title="Budgets" />

      <div className="px-4 pt-2">
        <BudgetSummaryCards
          totalSpent={data.totalSpent}
          totalLimit={data.totalLimit}
          percentageConsumed={data.percentageConsumed}
          primaryCurrency={data.primaryCurrency}
        />
      </div>

      <section aria-label="Budget categories">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Categories
          </h2>
        </div>
        <div className="space-y-3 px-4 pb-24">
          {sortedBudgets.map((item) => (
            <BudgetCard
              key={item.category}
              item={item}
              primaryCurrency={data.primaryCurrency}
              categoryMetaMap={categoryMetaMap}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
