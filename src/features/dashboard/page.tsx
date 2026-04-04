import { useMemo } from 'react';
import { useDashboard } from '@/api/hooks/use-dashboard';
import { useWallets } from '@/api/hooks/use-wallets';
import { useMonthStore } from '@/stores/month-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from './dashboard-header';
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

  return (
    <div className="pt-[max(env(safe-area-inset-top),16px)]">
      {/* Header always renders — greeting, avatar, month selector */}
      <DashboardHeader />

      {/* Loading state */}
      {dashboard.isLoading && (
        <div className="space-y-4 px-4 pb-4">
          {/* Net worth card */}
          <Skeleton className="h-40 w-full rounded-xl" />
          {/* Income / Spent stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          {/* Budget card */}
          <Skeleton className="h-20 w-full rounded-xl" />
          {/* Recent transactions */}
          <div>
            <Skeleton className="mb-3 h-4 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
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
        <div className="space-y-4 px-4 pb-4">
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
          />
        </div>
      )}
    </div>
  );
}
