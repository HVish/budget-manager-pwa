import { useState, useMemo, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useTransactions } from '@/api/hooks/use-transactions';
import { useWallets } from '@/api/hooks/use-wallets';
import { useCategories } from '@/api/hooks/use-categories';
import { buildCategoryMetaMap } from '@/lib/categories';
import { useMonthRange } from '@/stores/month-store';
import type { Transaction } from '@/api/types';
import { TRANSACTION_FILTER_TABS } from './transaction-filter-config';
import type { TransactionFilterTab } from './transaction-filter-config';
import { TransactionFilterTabs } from './transaction-filter-tabs';
import { TransactionDateGroup } from './transaction-date-group';
import { TransactionsPageSkeleton } from './transactions-skeleton';
import { TransactionsEmpty } from './transactions-empty';

// ---------------------------------------------------------------------------
// Date group type
// ---------------------------------------------------------------------------

interface DateGroup {
  date: string;
  transactions: Transaction[];
  dailyNet: number;
  currency: string | null; // null if mixed currencies
}

// ---------------------------------------------------------------------------
// TransactionsPage
// ---------------------------------------------------------------------------

export default function TransactionsPage() {
  const { startDate, endDate } = useMonthRange();
  const [activeTab, setActiveTab] = useState<TransactionFilterTab>('all');

  // Memoize the filters object so the query key only changes when inputs change,
  // not on every render. This avoids spurious refetches.
  const filters = useMemo(() => {
    const tabConfig = TRANSACTION_FILTER_TABS.find((t) => t.id === activeTab)!;
    return { startDate, endDate, ...tabConfig.filters };
  }, [activeTab, startDate, endDate]);

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useTransactions(filters);

  // Wallet name lookup map — cache hit if user visited dashboard first
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

  // Flatten all infinite query pages into a single sorted array
  const flatTransactions = useMemo(() => data?.pages.flatMap((p) => p.transactions) ?? [], [data]);

  // Group transactions by date (Map preserves insertion order = API's descending date order)
  const dateGroups = useMemo<DateGroup[]>(() => {
    const map = new Map<string, Transaction[]>();

    for (const tx of flatTransactions) {
      const dateKey = tx.transactionDate.split('T')[0];
      const existing = map.get(dateKey);
      if (existing) {
        existing.push(tx);
      } else {
        map.set(dateKey, [tx]);
      }
    }

    return Array.from(map.entries()).map(([date, txs]) => {
      const currencies = new Set(txs.map((t) => t.currency));
      const singleCurrency = currencies.size === 1 ? txs[0].currency : null;
      const dailyNet = singleCurrency ? txs.reduce((sum, t) => sum + t.amount, 0) : 0;

      return { date, transactions: txs, dailyNet, currency: singleCurrency };
    });
  }, [flatTransactions]);

  // Derive the active tab's label for the empty state message
  const activeTabLabel =
    activeTab === 'all' ? undefined : activeTab === 'income' ? 'income' : 'expense';

  // ---------------------------------------------------------------------------
  // Infinite scroll via IntersectionObserver
  // ---------------------------------------------------------------------------

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="pt-[max(env(safe-area-inset-top),16px)]">
      <PageHeader title="Transactions" />

      {/* Filter tabs — always visible above skeleton/content */}
      <TransactionFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Loading (initial) */}
      {isLoading && <TransactionsPageSkeleton />}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 px-4 pt-12 text-center">
          <p className="text-destructive text-sm">Failed to load transactions</p>
          <Button variant="link" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty */}
      {data && flatTransactions.length === 0 && <TransactionsEmpty filterLabel={activeTabLabel} />}

      {/* Content */}
      {data && flatTransactions.length > 0 && (
        <div className="space-y-4 px-4">
          {dateGroups.map((group) => (
            <TransactionDateGroup
              key={group.date}
              date={group.date}
              transactions={group.transactions}
              dailyNet={group.dailyNet}
              currency={group.currency}
              walletMap={walletMap}
              categoryMetaMap={categoryMetaMap}
            />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div
              role="status"
              className="flex justify-center py-4"
              aria-label="Loading more transactions"
            >
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Aria-live region for filter change announcements only.
          We key on activeTab so the region remounts and announces only when
          the user switches tabs, not on every infinite-scroll page load. */}
      {data && (
        <div key={activeTab} aria-live="polite" className="sr-only">
          {flatTransactions.length === 0
            ? `No ${activeTabLabel ? activeTabLabel + ' ' : ''}transactions this month`
            : `Showing ${activeTabLabel ?? 'all'} transactions`}
        </div>
      )}
    </div>
  );
}
