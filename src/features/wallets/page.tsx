import { useState, useMemo } from 'react';
import { WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { useWallets, useWalletHistories } from '@/api/hooks/use-wallets';
import { useDashboard } from '@/api/hooks/use-dashboard';
import { useMonthStore, useMonthRange } from '@/stores/month-store';
import { walletTypeConfig, WALLET_TYPE_ORDER } from '@/lib/wallet-types';
import { useAppNavigate } from '@/lib/navigation';
import type { Wallet, BalanceHistoryEntry, WalletType } from '@/api/types';
import type { WalletTypeConfig } from '@/lib/wallet-types';
import { WalletCard } from './wallet-card';
import { WalletFilterTabs } from './wallet-filter-tabs';
import { FILTER_TABS } from './wallet-filter-config';
import type { FilterTab } from './wallet-filter-config';
import { NetWorthSummary } from './net-worth-summary';

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function WalletsPageSkeleton() {
  return (
    <div className="pt-[max(env(safe-area-inset-top),16px)] pb-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="flex items-center justify-between px-4 pt-1 pb-4">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Net worth skeleton */}
      <div className="space-y-2 px-4 pb-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-44" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 px-4 pb-4">
        <Skeleton className="h-9 w-14 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Card skeletons */}
      <div className="space-y-3 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-30 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WalletGroup types
// ---------------------------------------------------------------------------

interface WalletGroup {
  type: WalletType;
  config: WalletTypeConfig;
  wallets: Wallet[];
}

// ---------------------------------------------------------------------------
// WalletsPage
// ---------------------------------------------------------------------------

export default function WalletsPage() {
  const { year, month } = useMonthStore();
  const { startDate, endDate } = useMonthRange();
  const navigate = useAppNavigate();

  const walletsQuery = useWallets();
  const dashboardQuery = useDashboard(year, month);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const wallets = useMemo(() => walletsQuery.data ?? [], [walletsQuery.data]);

  // Sparkline queries — one per wallet, batched via useQueries
  const walletIds = useMemo(() => wallets.map((w) => w.id), [wallets]);
  const sparklineQueries = useWalletHistories(walletIds, startDate, endDate);

  // Build a lookup map: walletId → BalanceHistoryEntry[]
  // Note: sparklineQueries is a new array ref each render, so this useMemo
  // recomputes every render. This is acceptable — the loop is O(n) over a
  // small wallet list (~5-10 items) and the Map construction is negligible.
  const sparklineMap = useMemo(() => {
    const map = new Map<string, BalanceHistoryEntry[]>();
    walletIds.forEach((id, i) => {
      const query = sparklineQueries[i];
      if (query?.data) {
        map.set(id, query.data);
      }
    });
    return map;
  }, [walletIds, sparklineQueries]);

  // Filter wallets by active tab (client-side)
  const filteredWallets = useMemo(() => {
    if (activeTab === 'all') return wallets;
    const tab = FILTER_TABS.find((t) => t.id === activeTab);
    if (!tab) return wallets;
    return wallets.filter((w) => tab.types.includes(w.walletType));
  }, [wallets, activeTab]);

  // Group filtered wallets by type in canonical order
  const groups = useMemo<WalletGroup[]>(() => {
    return WALLET_TYPE_ORDER.map((type) => ({
      type,
      config: walletTypeConfig[type],
      wallets: filteredWallets.filter((w) => w.walletType === type),
    })).filter((group) => group.wallets.length > 0);
  }, [filteredWallets]);

  // ---------------------------------------------------------------------------
  // Render: loading
  // ---------------------------------------------------------------------------

  if (walletsQuery.isLoading) {
    return <WalletsPageSkeleton />;
  }

  // ---------------------------------------------------------------------------
  // Render: error
  // ---------------------------------------------------------------------------

  if (walletsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
        <p className="text-destructive text-sm">Failed to load wallets</p>
        <Button variant="link" onClick={() => walletsQuery.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: empty (no wallets at all)
  // ---------------------------------------------------------------------------

  if (wallets.length === 0) {
    return (
      <div className="pt-[max(env(safe-area-inset-top),16px)]">
        <PageHeader title="Wallets" />
        <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20 text-center">
          <WalletCards className="text-muted-foreground/50 h-12 w-12" />
          <div>
            <p className="text-foreground text-base font-semibold">No wallets yet</p>
            <p className="text-muted-foreground mt-1 max-w-60 text-sm">
              Create a wallet to start tracking your finances.
            </p>
          </div>
          <Button onClick={() => navigate('/wallets/new')}>Create Your First Wallet</Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: main content
  // ---------------------------------------------------------------------------

  const activeTabConfig = FILTER_TABS.find((t) => t.id === activeTab);

  return (
    <>
      <div className="pt-[max(env(safe-area-inset-top),16px)] pb-6">
        {/* Header */}
        <PageHeader title="Wallets" />

        {/* Net worth summary */}
        {dashboardQuery.data && (
          <NetWorthSummary
            netWorth={dashboardQuery.data.netWorth}
            currency={dashboardQuery.data.primaryCurrency}
            conversionAvailable={dashboardQuery.data.conversionAvailable}
          />
        )}

        {/* Filter tabs */}
        <WalletFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Empty filter result */}
        {groups.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No {activeTabConfig?.label.toLowerCase()} wallets
            </p>
          </div>
        )}

        {/* Wallet groups */}
        {groups.map((group) => (
          <section key={group.type} aria-label={`${group.config.groupLabel} wallets`}>
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {group.config.groupLabel}
              </h2>
            </div>
            <div className="space-y-3 px-4">
              {group.wallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  sparklineData={sparklineMap.get(wallet.id)}
                  onEdit={(w) => navigate(`/wallets/${w.id}/edit`)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Aria-live region for filter announcements */}
      <div aria-live="polite" className="sr-only">
        {`Showing ${filteredWallets.length} wallet${filteredWallets.length !== 1 ? 's' : ''}`}
      </div>
    </>
  );
}
