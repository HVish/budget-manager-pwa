# Wallets Screen -- Technical Implementation Plan

**Date:** 2026-04-04
**Status:** Draft
**Design spec:** `docs/wallets-screen-design-spec.md`
**Estimated scope:** ~8 files new/modified, 0 new dependencies

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Deviations from Design Spec](#2-deviations-from-design-spec)
3. [Shared Abstractions to Extract First](#3-shared-abstractions-to-extract-first)
4. [Component Specifications](#4-component-specifications)
5. [Data Flow & Hook Strategy](#5-data-flow--hook-strategy)
6. [Sparkline Performance Strategy](#6-sparkline-performance-strategy)
7. [Filter Tab State Management](#7-filter-tab-state-management)
8. [New Utilities](#8-new-utilities)
9. [Implementation Order](#9-implementation-order)
10. [Risks & Open Questions](#10-risks--open-questions)

---

## 1. Architecture Overview

### Component Tree

```
WalletsPage
├── PageHeader title="Wallets"          (new shared component)
├── NetWorthSummary                     (new)
├── WalletFilterTabs                    (new)
├── WalletGroupSection[]                (inline in page -- not its own component)
│   ├── group header                    (simple markup)
│   └── WalletCard[]                    (rewrite of existing)
│       └── WalletSparkline             (new)
├── AddWalletButton                     (inline -- just a styled Button)
├── WalletForm                          (existing, unchanged)
└── aria-live region                    (inline)
```

### Data Dependencies

```
WalletsPage
├── useWallets()                → wallet list (already exists)
├── useDashboard(year, month)   → netWorth, primaryCurrency, conversionAvailable
├── useMonthStore()             → year, month for date range
└── useWalletHistories(ids)     → sparkline data for visible wallets (new hook)
```

---

## 2. Deviations from Design Spec

### 2.1 PageHeader: Shared Component, Not Two Copies

The design spec (Section 3.3) recommends extracting a shared `PageHeader`. This plan **requires** it as Task 1 rather than treating it as optional. The dashboard header and wallets header are identical in structure -- duplicating the ~45 lines of greeting/avatar/title/month-picker markup violates DRY and will inevitably drift.

**Change:** Extract `PageHeader` first, refactor `DashboardHeader` to use it, then use it in wallets. The dashboard page import changes from `<DashboardHeader />` to `<PageHeader title="Dashboard" />`.

### 2.2 No Per-Group "Add Wallet" Buttons

The spec (Section 7.4) suggests showing an "Add New Wallet" button at the bottom of each group when a filter is active. This is unnecessary complexity for minimal UX gain -- the user will never have so many wallets in a single type-group that the bottom of the page is unreachable. A single "Add New Wallet" button at the bottom of the entire list is sufficient in all cases.

**Change:** Always render one `AddWalletButton` at the bottom, regardless of filter state.

### 2.3 ChangeBadge: Not a Separate Component File

The design spec (Appendix A) places `ChangeBadge` in `src/components/change-badge.tsx`. Given the dashboard `NetWorthCard` already has a `TODO` comment for this same pattern, the badge should live in a shared location. However, since the only two consumers are the dashboard net-worth card and the wallets net-worth summary, and the API does not yet support month-over-month comparison, this component will be defined but not rendered. It will be co-located with `NetWorthSummary` for now and extracted when a second consumer materializes.

**Change:** Define `ChangeBadge` inline in `net-worth-summary.tsx`. Export it so dashboard can import it later. Do not create a standalone file yet.

### 2.4 Sparkline: Batched Fetch with `useQueries`, Not N Individual Hooks

The spec calls `useWalletHistory(id, start, end)` per wallet, which would create N independent query observers and N waterfall requests on mount. This plan uses `useQueries` to batch them. See [Section 6](#6-sparkline-performance-strategy) for details.

### 2.5 Net Worth Source: Dashboard API, Not Client-Side Sum

The spec (Section 4.4) suggests "computed client-side by summing all wallet balances." This is incorrect for multi-currency users -- you cannot add INR and USD amounts without conversion rates. The dashboard API already returns `netWorth` in `primaryCurrency` with server-side conversion. Use that as the single source of truth.

**Change:** `NetWorthSummary` receives `netWorth`, `currency`, and `conversionAvailable` as props from the dashboard query, not from summing `Wallet.balance`.

---

## 3. Shared Abstractions to Extract First

### 3.1 `PageHeader`

**File:** `src/components/layout/page-header.tsx`

This is the first task because both the dashboard refactor and the wallets page depend on it.

```tsx
interface PageHeaderProps {
  title: string;
  showMonthPicker?: boolean; // default: true
}
```

**Implementation:** Move the body of `DashboardHeader` into `PageHeader`, parameterizing the title. `DashboardHeader` becomes a one-line wrapper or is deleted entirely, with `DashboardPage` importing `PageHeader` directly.

**Existing code to move** (from `src/features/dashboard/dashboard-header.tsx`):

- Auth0 `useAuth0()` for avatar
- `useNavigate()` for settings button
- `getGreeting()` from `@/lib/date`
- `MonthSelectorSheet` from `@/components/month-selector`

**Props flow:**

```
DashboardPage → <PageHeader title="Dashboard" />
WalletsPage   → <PageHeader title="Wallets" />
```

### 3.2 `walletTypeConfig` Expansion

**File:** `src/lib/wallet-types.ts` (new)

The existing `walletTypeConfig` in `wallet-card.tsx` is too narrow (only `icon` and `label`). The redesign needs `balanceLabel`, `iconBg`, and `iconColor`. Rather than bloating the card component, extract this to a shared utility.

```tsx
import type { LucideIcon } from 'lucide-react';
import { Landmark, PiggyBank, Banknote, CreditCard, TrendingUp } from 'lucide-react';
import type { WalletType } from '@/api/types';

export interface WalletTypeConfig {
  icon: LucideIcon;
  label: string;
  groupLabel: string; // for section headers ("Credit & Loans")
  balanceLabel: string; // for card balance label ("Outstanding Balance")
  iconBg: string; // Tailwind class ("bg-chart-1/15")
  iconColor: string; // Tailwind class ("text-chart-1")
}

export const walletTypeConfig: Record<WalletType, WalletTypeConfig> = {
  checking: {
    icon: Landmark,
    label: 'Checking',
    groupLabel: 'Checking',
    balanceLabel: 'Available Balance',
    iconBg: 'bg-chart-1/15',
    iconColor: 'text-chart-1',
  },
  savings: {
    icon: PiggyBank,
    label: 'Savings',
    groupLabel: 'Savings',
    balanceLabel: 'Total Savings',
    iconBg: 'bg-income/15',
    iconColor: 'text-income',
  },
  cash: {
    icon: Banknote,
    label: 'Cash',
    groupLabel: 'Cash',
    balanceLabel: 'Cash on Hand',
    iconBg: 'bg-chart-2/15',
    iconColor: 'text-chart-2',
  },
  credit: {
    icon: CreditCard,
    label: 'Credit',
    groupLabel: 'Credit & Loans',
    balanceLabel: 'Outstanding Balance',
    iconBg: 'bg-expense/15',
    iconColor: 'text-expense',
  },
  investment: {
    icon: TrendingUp,
    label: 'Investments',
    groupLabel: 'Investments',
    balanceLabel: 'Current Value',
    iconBg: 'bg-chart-3/15',
    iconColor: 'text-chart-3',
  },
};

/** Ordered list of wallet types for consistent group rendering. */
export const WALLET_TYPE_ORDER: WalletType[] = [
  'checking',
  'savings',
  'cash',
  'investment',
  'credit',
];
```

This replaces the inline `walletTypeConfig` in `wallet-card.tsx` and the `walletTypes` array in `wallet-form.tsx` can reference it for labels too.

---

## 4. Component Specifications

### 4.1 `WalletsPage` (rewrite)

**File:** `src/features/wallets/page.tsx`

```tsx
interface WalletGroup {
  type: WalletType;
  config: WalletTypeConfig;
  wallets: Wallet[];
}
```

**State:**

- `filterTab: FilterTab` -- local `useState`, default `'all'`
- `formOpen: boolean` -- local `useState`, for WalletForm sheet
- `editWallet: Wallet | undefined` -- local `useState`, for edit mode

**Derived data (all `useMemo`):**

- `filteredWallets` -- apply filter tab to wallet list
- `groups: WalletGroup[]` -- group filtered wallets by type, in `WALLET_TYPE_ORDER`

**Queries:**

- `useWallets()` -- all wallets (no type filter; filtering is client-side)
- `useDashboard(year, month)` -- for net worth display
- `useMonthStore()` -- for year/month

**Render logic:**

```
if (walletsQuery.isLoading) → <WalletsPageSkeleton />
if (walletsQuery.isError)   → error state (existing pattern)
if (wallets.length === 0)   → empty state (no wallets at all)
else                        → header + net worth + tabs + groups + add button
```

### 4.2 `NetWorthSummary`

**File:** `src/features/wallets/net-worth-summary.tsx`

```tsx
interface NetWorthSummaryProps {
  netWorth: number;
  currency: Currency;
  conversionAvailable: boolean;
  // Future: changePercent?: number
}
```

This is a simpler, inline version of the dashboard's `NetWorthCard` -- no Card wrapper, just text + optional badge. It receives data as props (no hooks inside).

**Render:**

- "TOTAL NET WORTH" label
- Formatted amount using `formatCurrencyCompact()` (new utility, no decimals)
- `ChangeBadge` (conditionally rendered, currently never shown since no `changePercent` prop)

### 4.3 `WalletFilterTabs`

**File:** `src/features/wallets/wallet-filter-tabs.tsx`

```tsx
export type FilterTab = 'all' | 'liquid' | 'loans' | 'investments';

interface WalletFilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>; // for aria-live announcement
}

const FILTER_TABS: { id: FilterTab; label: string; types: WalletType[] }[] = [
  { id: 'all', label: 'All', types: [] },
  { id: 'liquid', label: 'Liquid', types: ['checking', 'savings', 'cash'] },
  { id: 'loans', label: 'Loans', types: ['credit'] },
  { id: 'investments', label: 'Investments', types: ['investment'] },
];
```

**Key decisions:**

- State is **lifted** into `WalletsPage` (not internal). The page needs `activeTab` to compute `filteredWallets` and for the aria-live region.
- The `FILTER_TABS` array is the single source of truth for which wallet types map to which tab. Export it so `WalletsPage` can use `tab.types` for filtering.
- `role="tablist"` with arrow-key navigation via a `useRef` + `onKeyDown` handler (no library needed).
- The `counts` prop is used in the parent for the aria-live announcement, not rendered inside the tabs.

### 4.4 `WalletCard` (rewrite)

**File:** `src/features/wallets/wallet-card.tsx`

```tsx
interface WalletCardProps {
  wallet: Wallet;
  sparklineData?: BalanceHistoryEntry[]; // undefined = still loading or no data
  onEdit: (wallet: Wallet) => void;
}
```

**Changes from current:**

- Two-row layout instead of single-row
- Type-specific icon colors from `walletTypeConfig`
- Balance label from `walletTypeConfig`
- Sparkline in bottom-right
- Edit button (pencil) in top-right with `stopPropagation`
- Account number masked via `maskAccountNumber()`
- Negative balances get `text-expense` color class

**Sparkline data is a prop, not fetched inside the card.** This is critical -- the card is a pure presentational component. Data fetching is orchestrated by the page. See [Section 6](#6-sparkline-performance-strategy).

### 4.5 `WalletSparkline`

**File:** `src/features/wallets/wallet-sparkline.tsx`

```tsx
interface WalletSparklineProps {
  data: BalanceHistoryEntry[];
  positive: boolean; // true = green stroke, false = red stroke
}
```

**Implementation:**

- Recharts `<AreaChart>` with no axes, no tooltip, no grid, no legend
- `<ResponsiveContainer width="100%" height={32}>` inside a `w-16 h-8` div
- Stroke: `var(--color-chart-1)` for positive, `var(--color-expense)` for negative
- Fill: linearGradient 20% to 0% opacity matching stroke
- `aria-hidden="true"` on the container
- Each sparkline needs a unique gradient ID to avoid SVG ID collisions: `sparkline-grad-${walletId}`

**Renders nothing if `data.length < 2`** (a single point cannot form a trend).

### 4.6 `WalletsPageSkeleton`

**File:** inline in `src/features/wallets/page.tsx` (private component)

Matches the skeleton layout from the design spec Section 9. Extracted as a named component within the same file for readability, not exported.

---

## 5. Data Flow & Hook Strategy

### 5.1 Query Orchestration in `WalletsPage`

```tsx
function WalletsPage() {
  const { year, month } = useMonthStore();
  const { startDate, endDate } = useMonthRange();

  // Primary data
  const walletsQuery = useWallets();
  const dashboardQuery = useDashboard(year, month);

  // Sparkline data (depends on wallets being loaded)
  const walletIds = walletsQuery.data?.map((w) => w.id) ?? [];
  const sparklineQueries = useWalletHistories(walletIds, startDate, endDate);

  // Build sparkline lookup: walletId → BalanceHistoryEntry[]
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

  // ... rest of component
}
```

### 5.2 New Hook: `useWalletHistories`

**File:** `src/api/hooks/use-wallets.ts` (add to existing)

```tsx
import { useQueries } from '@tanstack/react-query';

export function useWalletHistories(walletIds: string[], startDate: string, endDate: string) {
  return useQueries({
    queries: walletIds.map((id) => ({
      queryKey: ['wallets', id, 'history', { startDate, endDate }],
      queryFn: () =>
        api
          .get(`api/v1/wallets/${id}/history`, {
            searchParams: { startDate, endDate },
          })
          .json<BalanceHistoryEntry[]>(),
      enabled: !!id && !!startDate && !!endDate,
      staleTime: 5 * 60 * 1000, // 5 minutes -- balance history is append-only within a month
    })),
  });
}
```

This reuses the same query key structure as `useWalletHistory`, so the wallet detail page's existing history query will share the cache. No duplicate requests when navigating wallet list -> wallet detail.

### 5.3 Net Worth Data Flow

```
useDashboard(year, month)
  → dashboardQuery.data.netWorth          → NetWorthSummary.netWorth
  → dashboardQuery.data.primaryCurrency   → NetWorthSummary.currency
  → dashboardQuery.data.conversionAvailable → NetWorthSummary.conversionAvailable
```

The dashboard API is already fetched in the dashboard page. When the user navigates from Dashboard to Wallets, TanStack Query serves from cache (assuming `staleTime` has not elapsed). No redundant network request.

---

## 6. Sparkline Performance Strategy

### 6.1 The Problem

N wallets = N HTTP requests for balance history. For a user with 8 wallets, this is 8 parallel requests on page load.

### 6.2 The Solution: Layered Mitigation

1. **`useQueries` batching**: All N queries fire in parallel (not sequentially). TanStack Query's default `maxConcurrentQueries` is unlimited, so the browser's HTTP/2 multiplexing handles parallelism efficiently.

2. **Generous `staleTime` (5 minutes)**: Balance history for a completed month is immutable. For the current month, it changes at most once per day (end-of-day snapshot). 5 minutes is conservative and eliminates refetches on tab switches.

3. **Sparklines render independently**: Each card renders its sparkline as soon as its individual query resolves. The card shows the icon/name/balance immediately; the sparkline area is an empty `w-16 h-8` div until data arrives. No `<Skeleton>` for sparklines -- the empty space is sufficient and avoids layout shift (dimensions are fixed).

4. **No sparkline fetch for off-screen wallets** (future optimization, not needed for v1): If the user has 20+ wallets, we could use `IntersectionObserver` to defer sparkline queries for wallets below the fold. Not implementing this now because:
   - Users rarely have >10 wallets
   - The queries are cached aggressively
   - Adding IntersectionObserver increases complexity without measured need

5. **Query key sharing with detail page**: `useWalletHistories` uses the exact same query key pattern as `useWalletHistory`, so navigating to a wallet detail page for the same month hits the cache.

### 6.3 Future: Server-Side Batch Endpoint

If N requests becomes a real problem, the correct solution is a batch API endpoint:

```
GET /api/v1/wallets/history?walletIds=id1,id2&startDate=...&endDate=...
```

This is an API change, not a frontend concern. The `useWalletHistories` hook can be updated to call a single endpoint without changing any component code (consumers receive the same `Map<string, BalanceHistoryEntry[]>`).

---

## 7. Filter Tab State Management

### 7.1 Approach: Local Component State

```tsx
const [activeTab, setActiveTab] = useState<FilterTab>('all');
```

**Rationale:**

- Filter selection is transient UI state -- it should reset on navigation away and back
- No other component needs to know the current filter
- Persisting to Zustand/localStorage would be surprising UX (user returns to wallets tab and sees a filter they forgot they set)

### 7.2 Filtering Logic

```tsx
const filteredWallets = useMemo(() => {
  if (!wallets) return [];
  if (activeTab === 'all') return wallets;

  const tab = FILTER_TABS.find((t) => t.id === activeTab);
  if (!tab) return wallets;

  return wallets.filter((w) => tab.types.includes(w.walletType));
}, [wallets, activeTab]);
```

The `FILTER_TABS` constant is the single source of truth for type-to-tab mapping. Both the tab component (for rendering) and the page (for filtering) use it.

### 7.3 Grouping Logic

```tsx
const groups = useMemo(() => {
  return WALLET_TYPE_ORDER.map((type) => ({
    type,
    config: walletTypeConfig[type],
    wallets: filteredWallets.filter((w) => w.walletType === type),
  })).filter((group) => group.wallets.length > 0);
}, [filteredWallets]);
```

### 7.4 Aria-Live Announcement

When `activeTab` changes, the aria-live region announces the count:

```tsx
<div aria-live="polite" className="sr-only">
  {`Showing ${filteredWallets.length} wallet${filteredWallets.length !== 1 ? 's' : ''}`}
</div>
```

This is inline in `WalletsPage`, not inside `WalletFilterTabs`, because the tabs component does not know the filtered count.

---

## 8. New Utilities

### 8.1 `formatCurrencyCompact`

**File:** `src/lib/currency.ts` (add to existing)

```tsx
const compactFormatterCache = new Map<string, Intl.NumberFormat>();

function getCompactFormatter(currency: string): Intl.NumberFormat {
  if (!compactFormatterCache.has(currency)) {
    compactFormatterCache.set(
      currency,
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    );
  }
  return compactFormatterCache.get(currency)!;
}

/** Format minor units to display string without decimals. e.g. 12450000, "INR" → "₹1,24,500" */
export function formatCurrencyCompact(amountInMinorUnits: number, currency: string): string {
  return getCompactFormatter(currency).format(amountInMinorUnits / 100);
}
```

### 8.2 `maskAccountNumber`

**File:** `src/lib/currency.ts` (add to existing)

```tsx
/** Mask all but last 4 characters. e.g. "123456784521" → "····4521" */
export function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4);
  return `····${last4}`;
}
```

Using the Unicode middle dot character `·` (U+00B7) for the mask, matching the design spec.

### 8.3 `getWalletSubtitle`

**File:** `src/lib/wallet-types.ts` (add alongside config)

```tsx
import { maskAccountNumber } from '@/lib/currency';
import type { Wallet } from '@/api/types';

export function getWalletSubtitle(wallet: Wallet): string {
  const config = walletTypeConfig[wallet.walletType];
  const typeLabel = config?.label ?? 'Account';
  if (wallet.accountNumber) {
    return `${typeLabel} · ${maskAccountNumber(wallet.accountNumber)}`;
  }
  return typeLabel;
}
```

---

## 9. Implementation Order

Tasks are ordered to minimize blocked work. Each task produces a testable, independently shippable unit.

### Task 1: Extract `PageHeader` shared component

**Files:**

- Create: `src/components/layout/page-header.tsx`
- Modify: `src/features/dashboard/dashboard-header.tsx` (thin wrapper or delete)
- Modify: `src/features/dashboard/page.tsx` (update import if header file deleted)

**Acceptance:** Dashboard renders identically. No visual change. `PageHeader` accepts `title` prop.

**Why first:** Unblocks wallets header without code duplication. Can be merged independently.

---

### Task 2: Extract `walletTypeConfig` to shared utility

**Files:**

- Create: `src/lib/wallet-types.ts`
- Modify: `src/features/wallets/wallet-card.tsx` (remove inline config, import from shared)

**Acceptance:** Wallet card renders identically. Config is importable from `@/lib/wallet-types`.

**Why second:** Unblocks the card redesign and filter tabs. Small, safe refactor.

---

### Task 3: Add utility functions to `currency.ts`

**Files:**

- Modify: `src/lib/currency.ts` (add `formatCurrencyCompact`, `maskAccountNumber`)

**Acceptance:** Unit-testable. No UI changes.

---

### Task 4: Add `useWalletHistories` hook

**Files:**

- Modify: `src/api/hooks/use-wallets.ts` (add `useWalletHistories`)

**Acceptance:** Hook returns an array of query results. Same query key pattern as existing `useWalletHistory`.

---

### Task 5: Build `WalletSparkline` component

**Files:**

- Create: `src/features/wallets/wallet-sparkline.tsx`

**Acceptance:** Renders a 64x32 area chart given `BalanceHistoryEntry[]`. Renders nothing if `data.length < 2`. Green stroke for `positive=true`, red for `positive=false`.

---

### Task 6: Redesign `WalletCard`

**Files:**

- Modify: `src/features/wallets/wallet-card.tsx` (full rewrite)

**Acceptance:** New two-row layout. Uses `walletTypeConfig` for icons, colors, labels. Accepts `sparklineData` and `onEdit` props. Edit button has `stopPropagation`. Card click navigates to detail.

**Depends on:** Tasks 2, 3, 5

---

### Task 7: Build `WalletFilterTabs` component

**Files:**

- Create: `src/features/wallets/wallet-filter-tabs.tsx`

**Acceptance:** Renders horizontal scrollable tabs. Calls `onTabChange` on click. Arrow-key navigation works. ARIA attributes present.

---

### Task 8: Build `NetWorthSummary` component

**Files:**

- Create: `src/features/wallets/net-worth-summary.tsx`

**Acceptance:** Renders "TOTAL NET WORTH" label + formatted amount. Shows "---" when `conversionAvailable` is false. `ChangeBadge` defined but not rendered (no data source yet).

**Depends on:** Task 3 (for `formatCurrencyCompact`)

---

### Task 9: Rewrite `WalletsPage` (assembly)

**Files:**

- Modify: `src/features/wallets/page.tsx` (full rewrite)

**Acceptance:** Full page with header, net worth summary, filter tabs, grouped wallet cards with sparklines, add button, skeleton state, error state, empty state, empty-filter state, aria-live region.

**Depends on:** All previous tasks (1--8)

---

### Parallelization Opportunity

Tasks 1--4 are independent of each other and can be done in parallel.
Tasks 5, 7, 8 are independent of each other (only depend on earlier tasks).
Task 6 depends on 2, 3, 5.
Task 9 depends on everything.

```
Parallel track A: Task 1 (PageHeader)
Parallel track B: Task 2 (walletTypeConfig) → Task 6 (WalletCard redesign)
Parallel track C: Task 3 (utilities) → Task 8 (NetWorthSummary)
Parallel track D: Task 4 (useWalletHistories) → Task 5 (Sparkline)
Parallel track E: Task 7 (FilterTabs)
                              ↓ all converge ↓
                          Task 9 (WalletsPage assembly)
```

---

## 10. Risks & Open Questions

### 10.1 Risk: Tailwind v4 `bg-chart-1/15` Opacity Syntax

The design spec uses `bg-chart-1/15` to create a 15% opacity background from a chart color token. Verify that Tailwind v4's arbitrary opacity modifier works with custom CSS variable-based colors (oklch tokens). If not, fall back to:

```css
/* In src/styles/index.css */
.bg-chart-1-soft {
  background: oklch(from var(--color-chart-1) l c h / 15%);
}
```

**Mitigation:** Test this in Task 2 when setting up `walletTypeConfig`. If the syntax does not work, define explicit `-soft` utility classes in the CSS file.

### 10.2 Risk: SVG Gradient ID Collisions in Sparklines

Multiple `<AreaChart>` components on the same page each define a `<linearGradient>`. If they share the same `id`, only the first gradient definition wins and all charts use that color. The spec calls for green gradients on positive wallets and red on negative ones.

**Mitigation:** Each `WalletSparkline` receives the wallet ID and uses it in the gradient ID: `id={`sparkline-fill-${walletId}`}`. This is addressed in the component spec (Section 4.5).

### 10.3 Risk: Dashboard API Load on Wallets Page

The wallets page now calls `useDashboard()` for net worth data. This is the same query the dashboard page uses, so it will be cached if the user visited the dashboard first. However, if the user deep-links directly to `/wallets`, this is an additional API call.

**Mitigation:** Acceptable. The dashboard endpoint is fast (<100ms per backend SLO). The alternative (duplicating net worth computation client-side) is worse because it cannot handle multi-currency conversion.

### 10.4 Open Question: Month-Over-Month Net Worth Change

The design spec wants a "up 2.4%" badge. The current API does not support this. Options:

1. **Fetch two months of dashboard data** (current + previous) and compute the delta client-side. This doubles the dashboard API calls on the wallets page.
2. **Add `previousNetWorth` to the dashboard API response.** Cleanest solution but requires API change.
3. **Omit the badge** until the API supports it.

**Recommendation:** Option 3. The `ChangeBadge` component is built and ready, but not rendered. When the API adds `previousNetWorth`, enabling it is a one-line change. Do not fetch two months -- the latency and complexity are not justified for a decorative badge.

### 10.5 Open Question: `accountNumber` Field Presence

The `Wallet` type has `accountNumber?: string`. The design spec assumes it is always present for the subtitle. In practice, users may not provide it.

**Decision:** Already handled. `getWalletSubtitle()` falls back to just the type label when `accountNumber` is undefined. No open question remains.

### 10.6 Open Question: `icon-sm` Button Size Touch Target

The design spec requires `min-h-[44px] min-w-[44px]` on the edit button for WCAG compliance. The existing `icon-sm` button variant already includes `min-w-11 min-h-11` (44px). Confirmed by reading `src/components/ui/button.tsx` line 35. No additional override needed.

---

## Appendix: File Change Summary

| File                                          | Action                            | Task |
| --------------------------------------------- | --------------------------------- | ---- |
| `src/components/layout/page-header.tsx`       | Create                            | 1    |
| `src/features/dashboard/dashboard-header.tsx` | Modify (thin wrapper)             | 1    |
| `src/lib/wallet-types.ts`                     | Create                            | 2    |
| `src/lib/currency.ts`                         | Modify (add 2 functions)          | 3    |
| `src/api/hooks/use-wallets.ts`                | Modify (add `useWalletHistories`) | 4    |
| `src/features/wallets/wallet-sparkline.tsx`   | Create                            | 5    |
| `src/features/wallets/wallet-card.tsx`        | Rewrite                           | 6    |
| `src/features/wallets/wallet-filter-tabs.tsx` | Create                            | 7    |
| `src/features/wallets/net-worth-summary.tsx`  | Create                            | 8    |
| `src/features/wallets/page.tsx`               | Rewrite                           | 9    |

**No new npm dependencies required.** All functionality uses existing packages (Recharts, Lucide, TanStack Query, date-fns).
