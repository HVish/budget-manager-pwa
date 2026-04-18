import { useMemo } from 'react';
import { useDashboard } from '@/api/hooks/use-dashboard';
import { useWallets } from '@/api/hooks/use-wallets';
import { useCategories } from '@/api/hooks/use-categories';
import { buildCategoryMetaMap } from '@/lib/categories';
import { useMonthStore } from '@/stores/month-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { NetWorthCard } from './net-worth-card';
import { StatCard } from './stat-card';
import { MonthlyBudgetCard } from './monthly-budget-card';
import { RecentTransactions } from './recent-transactions';

export default function DashboardPage() {
  const { year, month } = useMonthStore();
  const dashboard = useDashboard(year, month);
  const wallets = useWallets();

  // Build wallet name lookup map — memoized to avoid rebuilding on every render
  const walletMap = useMemo(
    () =>
      (wallets.data ?? []).reduce<Record<string, string>>(
        (map, w) => ({ ...map, [w.id]: w.name }),
        {},
      ),
    [wallets.data],
  );

  // Category display name lookup
  const categoriesQuery = useCategories();
  const categoryMetaMap = useMemo(
    () => buildCategoryMetaMap(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  return (
    <div className="pt-[max(env(safe-area-inset-top),16px)] lg:pt-0">
      <PageHeader title="Dashboard" />

      {/* Loading state */}
      {dashboard.isLoading && (
        <div className="space-y-4 px-4 pb-4 lg:px-0">
          <Skeleton className="h-30 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {/* Error state */}
      {dashboard.isError && !dashboard.isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 px-4 pt-12 text-center">
          <p className="text-destructive text-sm">Failed to load dashboard</p>
          <Button variant="link" onClick={() => dashboard.refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Content */}
      {dashboard.data && (
        <div className="space-y-4 px-4 pb-4 lg:px-0">
          <NetWorthCard
            netWorth={dashboard.data.netWorth}
            currency={dashboard.data.primaryCurrency}
            conversionAvailable={dashboard.data.conversionAvailable}
          />

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              type="income"
              amount={dashboard.data.totalIncome}
              currency={dashboard.data.primaryCurrency}
              conversionAvailable={dashboard.data.conversionAvailable}
            />
            <StatCard
              type="spent"
              amount={dashboard.data.totalExpense}
              currency={dashboard.data.primaryCurrency}
              conversionAvailable={dashboard.data.conversionAvailable}
            />
          </div>

          <MonthlyBudgetCard year={year} month={month} />

          <RecentTransactions
            transactions={dashboard.data.recentTransactions}
            walletMap={walletMap}
            categoryMetaMap={categoryMetaMap}
          />
        </div>
      )}
    </div>
  );
}
