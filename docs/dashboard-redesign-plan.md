# Dashboard Redesign -- Implementation Plan

**Date:** 2026-04-04
**Source spec:** `docs/dashboard-redesign-spec.md`
**Scope:** Color system, app shell, dashboard page, month selector, bottom nav

---

## Implementation Phases

The work is organized into 6 phases. Each phase produces a buildable, non-broken state. Phases 1-2 are foundational (no visible feature changes); phases 3-6 deliver UI changes incrementally.

---

## Phase 1: Color System Overhaul

**Goal:** Replace all `.dark` token values and add new semantic tokens. This is a purely visual change that affects the entire app, so it must land first and be verified before any component work begins.

**Why first:** Every subsequent component uses these tokens. Getting them wrong causes cascading visual bugs that are hard to diagnose if mixed with structural changes.

### Step 1.1: Update `.dark` block in `src/styles/globals.css`

Replace every CSS custom property value inside the `.dark { }` block with the green-tinted oklch values from spec Section 1.1. Specifically:

- `--background`: `oklch(0.145 0 0)` --> `oklch(0.13 0.015 155)`
- `--foreground`: unchanged (`oklch(0.985 0 0)`)
- `--card`: `oklch(0.205 0 0)` --> `oklch(0.18 0.02 155)`
- `--card-foreground`: unchanged
- `--popover` / `--popover-foreground`: match card values
- `--primary`: `oklch(0.922 0 0)` --> `oklch(0.72 0.19 155)`
- `--primary-foreground`: `oklch(0.205 0 0)` --> `oklch(0.13 0.015 155)`
- `--secondary`: `oklch(0.269 0 0)` --> `oklch(0.22 0.025 155)`
- `--secondary-foreground`: unchanged
- `--muted`: `oklch(0.269 0 0)` --> `oklch(0.22 0.025 155)`
- `--muted-foreground`: `oklch(0.708 0 0)` --> `oklch(0.65 0.03 155)`
- `--accent` / `--accent-foreground`: match secondary values
- `--destructive`: unchanged
- `--border`: `oklch(1 0 0 / 10%)` --> `oklch(1 0 0 / 8%)`
- `--input`: `oklch(1 0 0 / 15%)` --> `oklch(1 0 0 / 12%)`
- `--ring`: `oklch(0.556 0 0)` --> `oklch(0.72 0.19 155)`
- `--income` / `--expense`: unchanged
- All `--chart-*` tokens: shift to green palette per spec
- All `--sidebar-*` tokens: update to match new green-tinted equivalents

### Step 1.2: Add new semantic tokens

Add three new custom properties to the `@theme inline` block:

```
--color-surface-elevated: var(--surface-elevated);
--color-accent-soft:      var(--accent-soft);
--color-accent-soft-foreground: var(--accent-soft-foreground);
```

Define values in `:root` (light fallback) and `.dark`:

- `:root` -- `--surface-elevated: oklch(0.97 0 0)`, `--accent-soft: oklch(0.205 0 0 / 8%)`, `--accent-soft-foreground: oklch(0.205 0 0)`
- `.dark` -- `--surface-elevated: oklch(0.20 0.025 155)`, `--accent-soft: oklch(0.72 0.19 155 / 12%)`, `--accent-soft-foreground: oklch(0.72 0.19 155)`

### Step 1.3: Verify contrast

After applying tokens, manually verify the contrast ratios from spec Section 1.4 in the browser. Pay particular attention to `--muted-foreground` on `--card` (target >= 4.5:1).

### Files changed

| File                     | Action                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| `src/styles/globals.css` | Modify `.dark` block, add to `@theme inline`, add to `:root` and `.dark` |

### Risk: Global visual regression

The color change affects every page in the app. The wallets pages, auth pages, and all shadcn primitives inherit these tokens.

**Mitigation:** This is low-risk because we are only changing values within the existing token system, not renaming tokens. All `bg-card`, `text-foreground`, `text-primary`, etc. class usages continue to work -- they just resolve to green-tinted values. Verify by loading `/wallets` and `/wallets/:id` after the change and confirming nothing looks broken (text legible, borders visible, buttons distinct).

---

## Phase 2: App Shell -- Remove Shared Header

**Goal:** Decouple the header from the shared layout so each page owns its own header area. This is a structural prerequisite for the dashboard-specific header (Phase 4).

### Step 2.1: Modify `src/components/layout/app-shell.tsx`

- Remove the `import { Header } from "./header"` line.
- Remove the `<Header />` render.
- Change `<main>` padding: `pb-20 pt-4` --> `pb-24` (increased to clear taller bottom nav with FAB; remove `pt-4` since pages now own top padding).

Result:

```tsx
<div className="bg-background flex min-h-dvh flex-col">
  <main className="flex-1 overflow-y-auto pb-24">
    <Outlet />
  </main>
  <BottomNav />
</div>
```

### Step 2.2: Add temporary top padding to non-dashboard pages

The wallets pages (`src/features/wallets/page.tsx` and `src/features/wallets/wallet-detail-page.tsx`) currently get their top spacing from the removed `pt-4` on `<main>`. After removing that, these pages lose their top padding.

Add `pt-4` to the outermost wrapper `<div>` in each of these pages to preserve their current appearance. This is a minimal, non-breaking shim.

**Do NOT** refactor these pages to have their own full header. That is out of scope for this redesign. The goal is to keep them visually unchanged.

### Step 2.3: Keep `src/components/layout/header.tsx` in the codebase (for now)

Do not delete the file yet. Other pages may want to import a simple header in the future. Mark it as deprecated with a comment at the top:

```tsx
/** @deprecated This shared header is no longer rendered in the app shell.
 *  Each page now owns its own header area. See dashboard-header.tsx for the pattern. */
```

The file can be deleted in a follow-up cleanup pass once all pages have been migrated.

### Files changed

| File                                          | Action                                              |
| --------------------------------------------- | --------------------------------------------------- |
| `src/components/layout/app-shell.tsx`         | Modify: remove Header import/render, adjust padding |
| `src/components/layout/header.tsx`            | Modify: add deprecation comment                     |
| `src/features/wallets/page.tsx`               | Modify: add `pt-4` to wrapper                       |
| `src/features/wallets/wallet-detail-page.tsx` | Modify: add `pt-4` to wrapper                       |

### Risk: Other pages losing spacing

Any page rendered inside the `AppShell` `<Outlet>` that relied on the shell's `pt-4` will lose top padding.

**Mitigation:** Check `src/routes.tsx` for all routes under the `AppShell` layout. Currently: `/dashboard`, `/wallets`, `/wallets/:id`. The dashboard will get its own header in Phase 4. The two wallet pages are handled in Step 2.2. No other pages exist yet.

---

## Phase 3: Bottom Nav with FAB

**Goal:** Rework the bottom navigation to 4 tabs + center FAB. This is independent of the dashboard content and can land in parallel with Phase 2.

### Step 3.1: Update `src/components/layout/bottom-nav.tsx`

**Tab configuration change:**

- Remove the `User` / "Profile" tab.
- Rename "Dashboard" label to "Overview".
- Rename "Txns" label to "Transactions".
- Keep the same icons and routes.

**Layout restructure:**

- Split tabs into two left (`/dashboard`, `/wallets`) and two right (`/transactions`, `/budgets`).
- Add a `<div className="w-16" />` spacer between them.
- Add the FAB as an absolutely positioned `<button>` centered on the nav bar.
- FAB spec: `h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-transform`, positioned with `absolute left-1/2 -translate-x-1/2 -top-5`.
- FAB icon: `<Plus className="h-6 w-6" />`.
- FAB must have `aria-label="Add transaction"`.
- FAB click handler: `navigate("/transactions/new")`. Note that this route does not exist yet -- the FAB will simply navigate there. When the transactions feature is built, the route will be added. For now, it will hit the catch-all redirect to `/dashboard`.

**Nav item spec:**

- Classes: `flex flex-col items-center gap-1 px-3 py-2 min-h-[44px] min-w-[44px] text-xs transition-colors`
- Active: `text-primary`
- Inactive: `text-muted-foreground`
- Remove the `hover:text-foreground` from current implementation -- add `hover:text-foreground` only for inactive state (desktop affordance).

### Step 3.2: Adjust outer `<nav>` classes

Keep the existing fixed positioning, backdrop-blur, and safe-area padding. The `px-2` on the inner flex container replaces the current implicit spacing from `justify-around`.

### Files changed

| File                                   | Action                            |
| -------------------------------------- | --------------------------------- |
| `src/components/layout/bottom-nav.tsx` | Modify: restructure tabs, add FAB |

### Risk: FAB overlapping content

The FAB protrudes 20px above the nav bar. The `pb-24` set in Phase 2 on the `<main>` element accounts for this (96px clears the 64px nav + 20px FAB overhang + margin).

**Mitigation:** Test on a page with long content that scrolls to the bottom. The last content item should not be hidden behind the FAB.

### Risk: `/transactions/new` route does not exist

The FAB targets a route that hasn't been built.

**Mitigation:** Acceptable. The catch-all route redirects to `/dashboard`. When the transaction creation feature is implemented, the route will exist. Add a `// TODO: Route to transaction creation flow` comment on the navigate call.

---

## Phase 4: Dashboard Header + Month Selector Rewrite

**Goal:** Build the new inline dashboard header with greeting, avatar, settings icon, title, and month pill. Rewrite the month selector as a bottom sheet.

### Step 4.1: Add greeting utility to `src/lib/date.ts`

Add a `getGreeting()` function:

```ts
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}
```

This is a pure function, easy to test, and belongs with the other date utilities.

### Step 4.2: Add currency icon mapping to `src/lib/currency.ts`

Add a `getCurrencyIcon(currency: Currency): LucideIcon` function that maps currency codes to lucide icons (`IndianRupee`, `DollarSign`, `Euro`, `PoundSterling`, `JapaneseYen`). AUD and CAD map to `DollarSign`.

This utility will be used by the Net Worth Card (Phase 5) and potentially other components.

### Step 4.3: Rewrite `src/components/month-selector.tsx`

Complete rewrite. The file will export two things:

1. `MonthSelectorSheet` -- the full `<Sheet>` wrapper (includes trigger + content).
2. The internal month list logic.

**Architecture:**

- Wrap everything in a `<Sheet>` from shadcn/ui.
- The trigger is a `<SheetTrigger>` wrapping a `<Button variant="outline" size="sm" className="rounded-full gap-1.5">` displaying `{formatMonthYear(year, month)}` + `<ChevronDown>`.
- The content uses `<SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl max-h-[60dvh]">`.
- Add a drag handle div at top: `<div className="flex justify-center pt-3 pb-1"><div className="h-1 w-10 rounded-full bg-muted-foreground/30" /></div>`.
- Header row with `<SheetTitle>` "Select Month" and a close button.
- A `<Separator>` below the header.
- A scrollable `<div className="overflow-y-auto flex-1 px-4 py-3 space-y-2 pb-[env(safe-area-inset-bottom)]">` containing month rows.

**Month list generation:**

- Generate from current month back 24 months (newest first).
- Use `isFutureMonth()` to guard against future months.
- Each row: `<button>` with `w-full rounded-xl px-4 py-3 min-h-[44px] flex items-center justify-between bg-card ring-1`. Selected row gets `ring-primary text-primary` + a `<Check>` icon. Unselected gets `ring-transparent`.

**Interaction:**

- Tapping a month calls `useMonthStore().setMonth(year, month)` and closes the sheet (set open state to false).
- Auto-scroll selected month into view on open using a `ref` + `scrollIntoView({ block: "center" })` in a `useEffect`.

**State management:**

- Use `useState` for `open` (sheet visibility). Pass `open` and `onOpenChange` to `<Sheet>`.

### Step 4.4: Create `src/features/dashboard/dashboard-header.tsx`

New component. Renders two rows inline (not fixed/sticky):

**Row 1 -- Greeting bar:**

- Container: `px-4 pt-[env(safe-area-inset-top)]`, inner: `flex items-center justify-between pt-4 pb-2`.
- Left side: `<Avatar>` (shadcn, 32x32) with `<AvatarFallback>` showing first character of `user.name` from Auth0 (`useAuth0()` hook). Next to it: greeting text from `getGreeting()` in `text-sm text-muted-foreground ml-3`.
- Right side: `<Button variant="ghost" size="icon">` wrapping `<Settings className="h-5 w-5" />`. Links to `/profile` via `useNavigate()`.

**Auth0 dependency:** The component imports `useAuth0` from `@auth0/auth0-react` to get the user's name. This is a read-only call to an already-available context. No new data fetching.

**Row 2 -- Title + month pill:**

- Container: `flex items-center justify-between px-4 pt-1 pb-4`.
- Left: `<h1 className="text-2xl font-bold text-foreground">Dashboard</h1>`.
- Right: `<MonthSelectorSheet />` from the rewritten month-selector.

### Files changed

| File                                          | Action                          |
| --------------------------------------------- | ------------------------------- |
| `src/lib/date.ts`                             | Modify: add `getGreeting()`     |
| `src/lib/currency.ts`                         | Modify: add `getCurrencyIcon()` |
| `src/components/month-selector.tsx`           | Rewrite: bottom sheet approach  |
| `src/features/dashboard/dashboard-header.tsx` | Create                          |

### Risk: Sheet component compatibility

The spec uses `showCloseButton={false}` on `SheetContent`. Verified that the current `sheet.tsx` already supports this prop (line 42 in the shadcn sheet component: `showCloseButton = true` default).

### Risk: Auth0 user object availability

`useAuth0().user` could be `undefined` during loading. The avatar fallback should handle this: show a generic icon or empty circle when `user` is null.

**Mitigation:** Use optional chaining: `user?.name?.[0]?.toUpperCase() ?? "?"`. The `AuthGuard` wrapper in `routes.tsx` ensures the user is authenticated before reaching the dashboard, so `user` should always be populated. But defensive coding is still warranted.

### Risk: Safe area insets on non-notch devices

`pt-[env(safe-area-inset-top)]` resolves to `0` on devices without a notch, which means no top padding at all.

**Mitigation:** Use the spec's recommended `pt-[max(env(safe-area-inset-top),16px)]` on the dashboard page wrapper (not the header component itself -- see Phase 5 for where this goes).

---

## Phase 5: Dashboard Cards (Net Worth, Income/Spent, Budget)

**Goal:** Build the three new card components and wire them into the dashboard page.

### Step 5.1: Create `src/features/dashboard/net-worth-card.tsx`

**Props:**

```ts
interface NetWorthCardProps {
  netWorth: number;
  currency: Currency;
  conversionAvailable: boolean;
}
```

**Structure:**

- `<Card>` with `<CardContent className="p-4">`.
- Icon badge: 40x40 `rounded-xl bg-accent-soft` container with dynamic currency icon from `getCurrencyIcon()`.
- Label: "Total Net Worth" in uppercase tracking-wider muted text.
- Amount: `text-3xl font-bold text-foreground tracking-tight`.
- Change indicator row: **Omit for initial implementation.** The `DashboardResponse` does not include month-over-month change data. Add a `// TODO: Add change indicator when API supports month-over-month comparison` comment. The card should not render the change row at all (not even a placeholder).
- When `conversionAvailable` is false: show the amount as a dash and a subtitle "Exchange rates unavailable" (same pattern as current `income-expense-card.tsx`).

### Step 5.2: Create `src/features/dashboard/stat-card.tsx`

A generic card component used for both Income and Spent.

**Props:**

```ts
interface StatCardProps {
  type: 'income' | 'spent';
  amount: number;
  currency: Currency;
}
```

**Structure:**

- `<Card>` with `<CardContent className="p-4">`.
- Icon circle: 36x36 (`h-9 w-9`) `rounded-full bg-accent-soft`. Income uses `ArrowDownLeft`, spent uses `ArrowUpRight`, both in `text-accent-soft-foreground`.
- Label: "Income" or "Spent" in `text-xs text-muted-foreground`.
- Amount: `text-lg font-bold`. Income uses `text-income`, spent uses `text-foreground` (per spec -- spent is white, not red).

### Step 5.3: Create `src/features/dashboard/monthly-budget-card.tsx`

**Data source:** Uses `useBudgetSummary(year, month)` hook from `src/api/hooks/use-budgets.ts`.

**Props:**

```ts
interface MonthlyBudgetCardProps {
  year: number;
  month: number;
}
```

The component calls `useBudgetSummary` internally (it is a data-fetching component, not a pure presentational one). This is intentional -- the budget data is independent from the dashboard API response and has its own loading/error states.

**Structure:**

- `<Card>` with `<CardContent className="p-4">`.
- Title row: "Monthly Budget" label + `{percentageConsumed}%` text.
- Progress bar: `h-1.5 rounded-full bg-muted` track with a `bg-primary` fill bar. Fill width is `Math.min(percentageConsumed, 100)%`. Color logic: `< 75` = `bg-primary`, `< 90` = `bg-yellow-500`, `>= 90` = `bg-destructive`.
- Remaining text: `{formatCurrency(remaining, currency)} left to spend`. If over budget, change to `{formatCurrency(overage, currency)} over budget` in `text-destructive`.

**Edge cases:**

- Loading: show a `<Skeleton className="h-20 w-full rounded-xl" />` in place of the card.
- Error: silently hide the card (budget is supplementary data; don't block the dashboard).
- No budgets: show "No budgets configured" text with a `<Link>` to `/budgets` in `text-primary`.

### Step 5.4: Delete `src/features/dashboard/income-expense-card.tsx`

This component is fully replaced by `net-worth-card.tsx` and `stat-card.tsx`. Remove the file.

### Step 5.5: Remove `wallet-summary.tsx` from dashboard

The spec drops the wallet summary from the dashboard (it belongs on the wallets page). **Do not delete the file** -- it may be reused on the wallets page in the future. Just remove its import and usage from `page.tsx`.

### Files changed

| File                                             | Action |
| ------------------------------------------------ | ------ |
| `src/features/dashboard/net-worth-card.tsx`      | Create |
| `src/features/dashboard/stat-card.tsx`           | Create |
| `src/features/dashboard/monthly-budget-card.tsx` | Create |
| `src/features/dashboard/income-expense-card.tsx` | Delete |

### Risk: Budget summary API returns error or user has no budgets

The `MonthlyBudgetCard` fetches independently from the dashboard. If the budget API fails, it should not affect the rest of the dashboard.

**Mitigation:** The component handles its own loading/error states internally. On error, render nothing (return `null`). This keeps the dashboard functional even if budget data is unavailable.

### Risk: Duplicate `useWallets()` call

The current dashboard page calls `useWallets()` for the wallet summary. After removing the wallet summary, this call is no longer needed in the dashboard page. Remove the import and call from `page.tsx` to avoid unnecessary API calls.

**However:** The recent transactions section needs wallet names for the subtitle (Phase 6). So `useWallets()` must stay in the dashboard page, but for a different reason. See Phase 6.

---

## Phase 6: Recent Transactions Restyle + Dashboard Page Assembly

**Goal:** Restyle the recent transactions section and assemble the final dashboard page layout.

### Step 6.1: Restyle `src/features/dashboard/recent-transactions.tsx`

**Key changes from current:**

- Remove the outer `<Card>` wrapper. The section sits directly on the page background.
- Add a section header row: "Recent Transactions" title + "View All" link button (navigates to `/transactions`).
- Each transaction row becomes its own card-like element: `rounded-xl bg-card p-3 ring-1 ring-foreground/10`.
- Section uses `space-y-3` between rows.

**Transaction row changes:**

- Icon circle: `h-10 w-10` (up from `h-8 w-8`). Icon: `h-5 w-5` (up from `h-4 w-4`).
- Subtitle: change from date-only (`"MMM d"`) to `"{category label} . {wallet name}"`. Requires wallet name lookup.
- Amount column: add time below the amount (`format(parseISO(tx.transactionDate), "h:mm a")`).
- Expense amount color: `text-foreground` (white) not `text-expense` (red). Prefix with `-`. Income keeps `text-income` with `+` prefix.
- Use `Math.abs(tx.amount)` for display since we are adding explicit +/- prefixes.

**Wallet name lookup:**

- The component receives a `walletMap` prop: `Record<string, string>` mapping wallet ID to name.
- The parent (`page.tsx`) builds this from `useWallets()` data: `wallets.reduce((map, w) => ({ ...map, [w.id]: w.name }), {} as Record<string, string>)`.
- If a wallet ID is not found in the map (edge case: wallet deleted), fall back to empty string.

**Updated props:**

```ts
interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
  walletMap: Record<string, string>;
}
```

**Empty state:**

- Replace the `<Card>` wrapped empty state with: `<div className="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">`.

### Step 6.2: Rewrite `src/features/dashboard/page.tsx`

**New imports:**

- `DashboardHeader` (from `./dashboard-header`)
- `NetWorthCard` (from `./net-worth-card`)
- `StatCard` (from `./stat-card`)
- `MonthlyBudgetCard` (from `./monthly-budget-card`)
- `RecentTransactions` (restyled, from `./recent-transactions`)
- Remove: `IncomeExpenseCard`, `WalletSummary` imports
- Keep: `useDashboard`, `useWallets`, `useMonthStore`, `Skeleton`, `Button`

**Page structure:**

```
<div className="pt-[max(env(safe-area-inset-top),16px)]">
  <DashboardHeader />
  {/* Loading / Error / Content states */}
  <div className="space-y-4 px-4 pb-4">
    <NetWorthCard ... />
    <div className="grid grid-cols-2 gap-3">
      <StatCard type="income" ... />
      <StatCard type="spent" ... />
    </div>
    <MonthlyBudgetCard year={year} month={month} />
    <RecentTransactions transactions={...} walletMap={...} />
  </div>
</div>
```

**Key decision:** The `<DashboardHeader />` renders outside the loading/error conditional. The header (greeting, title, month selector) should always be visible, even when the data is loading or errored. Only the card content area shows skeletons or error states.

**Skeleton state update:**
Replace the current skeleton layout with the new layout from spec Section 11. The header is always rendered (not skeletonized for the auth-loaded state, since `AuthGuard` ensures user data is available). The content area shows skeletons matching the new card layout.

**Wallet map construction:**

```ts
const wallets = useWallets();
const walletMap = useMemo(
  () =>
    (wallets.data ?? []).reduce<Record<string, string>>(
      (map, w) => ({ ...map, [w.id]: w.name }),
      {},
    ),
  [wallets.data],
);
```

Import `useMemo` from React. The memo avoids rebuilding the map on every render.

### Files changed

| File                                             | Action                                       |
| ------------------------------------------------ | -------------------------------------------- |
| `src/features/dashboard/recent-transactions.tsx` | Modify: restyle, new props                   |
| `src/features/dashboard/page.tsx`                | Modify: new layout, imports, skeleton states |

### Risk: Wallet data loading independently from dashboard data

`useWallets()` and `useDashboard()` are separate queries. The wallet map might not be ready when the dashboard data arrives, causing transaction rows to show empty wallet names briefly.

**Mitigation:** This is acceptable. The wallet list is cached aggressively (`staleTime: 2 minutes` from the QueryClient default). After the first load, it resolves from cache nearly instantly. The fallback empty string for missing wallet names is a reasonable degradation.

---

## Dependency Graph

```
Phase 1 (Color System)
  |
  v
Phase 2 (App Shell)  ----+----> Phase 3 (Bottom Nav)
  |                       |
  v                       |
Phase 4 (Header + Month Selector)
  |
  v
Phase 5 (Dashboard Cards)
  |
  v
Phase 6 (Recent Txns + Page Assembly)
```

Phases 2 and 3 can be done in parallel (they modify different files). All other phases are sequential.

---

## Files Changed Summary

| File                                             | Phase | Action                                                |
| ------------------------------------------------ | ----- | ----------------------------------------------------- |
| `src/styles/globals.css`                         | 1     | Modify: green-tinted dark tokens, add semantic tokens |
| `src/components/layout/app-shell.tsx`            | 2     | Modify: remove Header, adjust padding                 |
| `src/components/layout/header.tsx`               | 2     | Modify: add deprecation comment                       |
| `src/features/wallets/page.tsx`                  | 2     | Modify: add top padding                               |
| `src/features/wallets/wallet-detail-page.tsx`    | 2     | Modify: add top padding                               |
| `src/components/layout/bottom-nav.tsx`           | 3     | Modify: 4 tabs + FAB                                  |
| `src/lib/date.ts`                                | 4     | Modify: add `getGreeting()`                           |
| `src/lib/currency.ts`                            | 4     | Modify: add `getCurrencyIcon()`                       |
| `src/components/month-selector.tsx`              | 4     | Rewrite: bottom sheet                                 |
| `src/features/dashboard/dashboard-header.tsx`    | 4     | Create                                                |
| `src/features/dashboard/net-worth-card.tsx`      | 5     | Create                                                |
| `src/features/dashboard/stat-card.tsx`           | 5     | Create                                                |
| `src/features/dashboard/monthly-budget-card.tsx` | 5     | Create                                                |
| `src/features/dashboard/income-expense-card.tsx` | 5     | Delete                                                |
| `src/features/dashboard/recent-transactions.tsx` | 6     | Modify: restyle                                       |
| `src/features/dashboard/page.tsx`                | 6     | Modify: new layout, new components                    |

**New files:** 4
**Modified files:** 11
**Deleted files:** 1

---

## New shadcn/ui Components Required

The spec uses `Avatar`, `Badge`, `Sheet`, `Separator`, and `Skeleton`. Checking against the existing `src/components/ui/` directory:

- `avatar.tsx` -- already exists
- `badge.tsx` -- already exists
- `sheet.tsx` -- already exists
- `separator.tsx` -- already exists
- `skeleton.tsx` -- already exists

**No new shadcn components need to be added via CLI.**

---

## New npm Dependencies

None. All icons (`IndianRupee`, `DollarSign`, `Euro`, `PoundSterling`, `JapaneseYen`, `ArrowDownLeft`, `ArrowUpRight`, `Settings`, `Plus`, `Check`, `ChevronDown`, `X`) are available in the already-installed `lucide-react`.

---

## Testing Checklist

### After Phase 1

- [ ] Load `/dashboard` -- background should have a green tint, not pure gray
- [ ] Load `/wallets` -- cards, buttons, and text remain legible
- [ ] Open any shadcn dialog/sheet -- popover background matches card color
- [ ] Check income (green) and expense (red) amounts are still clearly distinguishable

### After Phase 2

- [ ] No sticky header visible on any page
- [ ] `/wallets` and `/wallets/:id` still have proper top spacing
- [ ] Content scrolls freely without header obstruction

### After Phase 3

- [ ] Bottom nav shows 4 tabs with correct labels
- [ ] FAB is centered between tabs, protrudes above nav bar
- [ ] FAB has visible green shadow
- [ ] FAB tap navigates (or redirects) without error
- [ ] Tab highlights work correctly on each route
- [ ] No content hidden behind bottom nav or FAB when scrolled to bottom

### After Phase 4

- [ ] Dashboard shows greeting appropriate to time of day
- [ ] Avatar shows user initial
- [ ] Settings icon is tappable (44px touch target)
- [ ] Month pill shows current month
- [ ] Tapping month pill opens bottom sheet
- [ ] Sheet shows 24 months, current month is highlighted with check mark
- [ ] Selected month auto-scrolls into view
- [ ] Tapping a different month updates the pill and closes the sheet
- [ ] Future months do not appear in the list
- [ ] Sheet closes on overlay tap and X button

### After Phase 5

- [ ] Net worth card shows currency icon appropriate to primary currency
- [ ] Income card shows green amount, spent card shows white amount
- [ ] Budget card shows progress bar with correct fill
- [ ] Budget card shows correct color at different percentage thresholds
- [ ] Budget card handles no-budgets state with link to `/budgets`
- [ ] Budget card loading does not block other dashboard content

### After Phase 6

- [ ] Transaction rows show category label and wallet name in subtitle
- [ ] Transaction rows show time (e.g. "4:39 pm")
- [ ] "View All" link navigates to `/transactions`
- [ ] Empty state renders correctly
- [ ] Full page scroll works smoothly with all sections
- [ ] Skeleton loading state matches new layout structure

### Cross-cutting

- [ ] `pnpm build` succeeds with no type errors
- [ ] `pnpm lint` passes
- [ ] No console errors or warnings in dev tools
