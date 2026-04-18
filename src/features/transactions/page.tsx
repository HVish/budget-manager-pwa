import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useTransactions } from '@/api/hooks/use-transactions';
import { useWallets } from '@/api/hooks/use-wallets';
import { useCategories } from '@/api/hooks/use-categories';
import { buildCategoryMetaMap } from '@/lib/categories';
import { useMonthRange } from '@/stores/month-store';
import { useDebouncedValue } from '@/lib/use-debounce';
import { TRANSACTION_FILTER_TABS } from './transaction-filter-config';
import { groupTransactionsByDate } from './group-by-date';
import type { TransactionFilterTab } from './transaction-filter-config';
import { TransactionFilterTabs } from './transaction-filter-tabs';
import { TransactionDateGroup } from './transaction-date-group';
import { TransactionsPageSkeleton } from './transactions-skeleton';
import { TransactionsEmpty } from './transactions-empty';
import { TransactionSearchBar } from './transaction-search-bar';
import { TransactionFilterSheet } from './transaction-filter-sheet';
import type { TransactionFilterState } from './transaction-filter-sheet';

// ---------------------------------------------------------------------------
// TransactionsPage
// ---------------------------------------------------------------------------

export default function TransactionsPage() {
  const { startDate, endDate } = useMonthRange();
  const [activeTab, setActiveTab] = useState<TransactionFilterTab>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<TransactionFilterState>({
    walletIds: [],
    category: undefined,
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Stable setter: only update state when the filter content actually changed,
  // so the query key (and therefore the cache entry) stays stable.
  const applyAdvancedFilters = useCallback((next: TransactionFilterState) => {
    setAdvancedFilters((prev) => {
      const same =
        prev.category === next.category &&
        prev.walletIds.length === next.walletIds.length &&
        prev.walletIds.every((id, i) => id === next.walletIds[i]);
      return same ? prev : next;
    });
  }, []);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const isSearchActive = debouncedSearch.length >= 2;
  const hasAdvancedFilters =
    advancedFilters.walletIds.length > 0 || advancedFilters.category !== undefined;
  const hasActiveFilters = hasAdvancedFilters;

  // Memoize the filters object so the query key only changes when inputs change,
  // not on every render. This avoids spurious refetches.
  const filters = useMemo(() => {
    const tabConfig = TRANSACTION_FILTER_TABS.find((t) => t.id === activeTab)!;
    const base = { ...tabConfig.filters };

    // When search is active, omit date range so search spans all time
    const dateBounds = isSearchActive ? {} : { startDate, endDate };

    return {
      ...dateBounds,
      ...base,
      ...(isSearchActive ? { title: debouncedSearch } : {}),
      ...(advancedFilters.walletIds.length ? { walletIds: advancedFilters.walletIds } : {}),
      ...(advancedFilters.category ? { category: advancedFilters.category } : {}),
    };
  }, [activeTab, startDate, endDate, debouncedSearch, isSearchActive, advancedFilters]);

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

  // Group transactions by date (newest first) with daily net totals
  const dateGroups = useMemo(() => groupTransactionsByDate(flatTransactions), [flatTransactions]);

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
    <div className="pt-[max(env(safe-area-inset-top),16px)] lg:pt-0">
      <PageHeader title="Transactions" />

      <TransactionSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={hasActiveFilters}
        onFilterPress={() => setFilterSheetOpen(true)}
      />

      {/* Filter tabs — always visible above skeleton/content */}
      <TransactionFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {isSearchActive && (
        <div className="px-4 pb-2 lg:px-0">
          <div className="bg-card ring-foreground/10 flex items-center gap-2 rounded-xl px-3 py-2 ring-1">
            <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
            <p className="text-muted-foreground text-xs">
              Searching across <span className="text-foreground font-medium">all months</span>
            </p>
          </div>
        </div>
      )}

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
      {data && flatTransactions.length === 0 && (
        <TransactionsEmpty
          filterLabel={activeTabLabel}
          isSearching={isSearchActive || hasAdvancedFilters}
        />
      )}

      {/* Content */}
      {data && flatTransactions.length > 0 && (
        <div className="space-y-4 px-4 lg:px-0">
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

      <TransactionFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={advancedFilters}
        onApply={applyAdvancedFilters}
      />
    </div>
  );
}
