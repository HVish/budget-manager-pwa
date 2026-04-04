# Wallets Screen -- Design Specification

**Date:** 2026-04-04
**Status:** Draft
**Scope:** Wallets list page redesign -- header, net worth summary, filter tabs, wallet cards with sparklines, grouped layout, add-wallet CTA
**Depends on:** Dashboard redesign spec (color system, header pattern, bottom nav)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Page Layout Structure](#2-page-layout-structure)
3. [Header Section](#3-header-section)
4. [Net Worth Summary](#4-net-worth-summary)
5. [Filter Tabs](#5-filter-tabs)
6. [Wallet Card (Redesigned)](#6-wallet-card-redesigned)
7. [Wallet Group Sections](#7-wallet-group-sections)
8. [Add New Wallet CTA](#8-add-new-wallet-cta)
9. [Skeleton Loading State](#9-skeleton-loading-state)
10. [Empty & Error States](#10-empty--error-states)
11. [Interaction & Animation](#11-interaction--animation)
12. [Responsive Behavior](#12-responsive-behavior)
13. [Accessibility](#13-accessibility)
14. [Data Mapping](#14-data-mapping)
15. [Design Drift & Recommendations](#15-design-drift--recommendations)

---

## 1. Overview

The wallets screen is the second primary destination in the app (bottom nav: Overview, **Wallets**, +, Transactions, Budget). It presents all user wallets grouped by type, with a net worth summary at the top and filterable tabs. Each wallet card shows balance, a mini sparkline trend, and metadata.

### Current State

The existing `src/features/wallets/page.tsx` is minimal: a flat list of `WalletCard` components with a top-right "Add" button. No header, no net worth summary, no filter tabs, no sparklines, no grouping.

### Target State

A full-featured wallets screen matching the screenshot design, adapted to the existing green-tinted dark theme and component patterns established in the dashboard redesign.

---

## 2. Page Layout Structure

**File:** `src/features/wallets/page.tsx` (rewrite)

The page scrolls vertically within the `<AppShell>` main area. No fixed/sticky elements besides the bottom nav (handled by shell).

```
<div>
  <WalletsHeader />                    -- greeting bar + title + month picker
  <NetWorthSummary />                  -- total net worth + change badge
  <WalletFilterTabs />                 -- horizontal pill tabs
  <WalletGroupSection />               -- one per wallet type group (repeated)
    <WalletCard />                     -- individual wallet (repeated)
  <AddWalletButton />                  -- ghost/outline CTA at bottom of each group
</div>
```

### Outer Container

```
className="pb-6"
```

No `px-*` on the outer wrapper -- each section manages its own horizontal padding (`px-4`, 16px) to allow edge-to-edge backgrounds where needed (e.g., filter tabs horizontal scroll).

---

## 3. Header Section

Reuse the exact same header pattern from the dashboard. This ensures visual consistency across the two primary tab destinations.

**File:** New component `src/features/wallets/wallets-header.tsx`

### 3.1 Row 1: Greeting Bar

```
Container:  px-4
Inner:      flex items-center justify-between pt-4 pb-2
```

| Element           | Token / Class                                                   | Notes                                                 |
| ----------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| **Avatar**        | `<Avatar size="default">` (32x32)                               | Auth0 user picture with initial fallback              |
| Avatar fallback   | `bg-primary text-primary-foreground text-sm font-semibold`      | Green circle with white initial                       |
| **Greeting text** | `text-sm text-muted-foreground ml-3`                            | "Good Morning," / "Good Afternoon," / "Good Evening," |
| **Settings icon** | `<Button variant="ghost" size="icon">` with `min-h-11 min-w-11` | 44px touch target. `<Settings className="h-5 w-5" />` |

### 3.2 Row 2: Title + Month Pill

```
Container:  flex items-center justify-between px-4 pt-1 pb-4
```

| Element          | Token / Class                        | Notes                                                       |
| ---------------- | ------------------------------------ | ----------------------------------------------------------- |
| **Page title**   | `text-2xl font-bold text-foreground` | "Wallets"                                                   |
| **Month picker** | `<MonthSelectorSheet />`             | Reuse existing component from `@/components/month-selector` |

### 3.3 Recommendation: Extract Shared Header

Both dashboard and wallets use identical greeting + title + month-picker rows. Extract a shared `<PageHeader title="Wallets" />` component into `src/components/layout/page-header.tsx` to eliminate duplication.

```tsx
interface PageHeaderProps {
  title: string;
  showMonthPicker?: boolean; // default true
}
```

---

## 4. Net Worth Summary

Rendered inline below the header, inside the same scroll area.

**File:** New component `src/features/wallets/net-worth-summary.tsx`

```
Container:  px-4 pb-4
```

### 4.1 Layout

```
<div className="space-y-1">
  <p>TOTAL NET WORTH</p>
  <div className="flex items-center gap-3">
    <p>amount</p>
    <Badge>change</Badge>
  </div>
</div>
```

### 4.2 Token Mapping

| Element          | Token / Class                                                        | Screenshot Value  |
| ---------------- | -------------------------------------------------------------------- | ----------------- |
| **Label**        | `text-xs font-medium tracking-wider uppercase text-muted-foreground` | "TOTAL NET WORTH" |
| **Amount**       | `text-3xl font-bold tracking-tight text-foreground`                  | "Rs.124,500"      |
| **Change badge** | Custom badge (see below)                                             | "up 2.4%"         |

### 4.3 Change Badge

The screenshot shows a green pill with an upward arrow and percentage. Map to a custom component:

```
Container:  inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
Positive:   bg-income/15 text-income
Negative:   bg-expense/15 text-expense
Neutral:    bg-muted text-muted-foreground
```

| Element    | Token / Class                                                                    |
| ---------- | -------------------------------------------------------------------------------- |
| Arrow icon | `<TrendingUp className="h-3 w-3" />` (positive) or `<TrendingDown />` (negative) |
| Percentage | `text-xs font-semibold`                                                          |

### 4.4 Data Source

The net worth is computed client-side by summing all wallet balances (converted to primary currency via dashboard API). The percentage change requires month-over-month comparison -- the dashboard API provides `netWorth` for the selected month. If the API does not yet support previous-month comparison, display the badge only when data is available, or hide it entirely.

**Fallback:** If month-over-month data is unavailable, omit the change badge entirely rather than showing stale or fabricated data.

---

## 5. Filter Tabs

Horizontal scrollable pill tabs for filtering wallets by type.

**File:** New component `src/features/wallets/wallet-filter-tabs.tsx`

### 5.1 Layout

```
Container:      px-4 pb-4
Scroll wrapper: flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4
```

The negative margin + padding trick allows pills to scroll edge-to-edge while the resting position aligns with the page's 16px padding.

### 5.2 Tab Items

| Filter      | Maps to `WalletType` values   |
| ----------- | ----------------------------- |
| All         | No filter (show all)          |
| Liquid      | `checking`, `savings`, `cash` |
| Loans       | `credit`                      |
| Investments | `investment`                  |

### 5.3 Token Mapping

| State        | Token / Class                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| **Active**   | `bg-primary text-primary-foreground font-semibold`                                                              |
| **Inactive** | `bg-secondary text-secondary-foreground font-medium`                                                            |
| **Shared**   | `rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors min-h-[36px]`                               |
| **Focus**    | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` |

### 5.4 Interaction

- Tapping a tab filters the wallet list immediately (client-side filter, no API call).
- Use local component state (`useState`) for the active filter -- not persisted to store.
- The "All" tab is selected by default on page load.
- Smooth transition on color change: `transition-colors duration-150`.

### 5.5 Touch Target

Each pill must be at least 36px tall (acceptable since they are spaced and large enough for comfortable tapping). The `min-h-[36px]` combined with `py-2` and `text-sm` achieves this. Adjacent pills have 8px gap which meets minimum spacing.

### 5.6 Screenshot Drift: Tab Naming

The screenshot shows "In..." (truncated). This is "Investments". Use the full word since the tabs scroll horizontally and truncation is unnecessary and confusing. Display: "All", "Liquid", "Loans", "Investments".

---

## 6. Wallet Card (Redesigned)

Major redesign of `src/features/wallets/wallet-card.tsx`.

### 6.1 Anatomy

```
+-------------------------------------------------------+
|  [Icon Circle]  Wallet Name                    [Edit]  |
|                 Subtitle (institution/acct)             |
|                                                        |
|  Balance Label                                         |
|  Rs.8,450.20                          [~~sparkline~~]  |
+-------------------------------------------------------+
```

### 6.2 Outer Container

```tsx
<Card className="hover:bg-accent/50 cursor-pointer transition-all duration-150 active:scale-[0.98]">
  <CardContent className="p-4">...</CardContent>
</Card>
```

The card uses the existing `Card` component which applies `bg-card rounded-xl border`.

### 6.3 Row 1: Identity Row

```
Container:  flex items-start justify-between gap-3
```

#### Left: Icon + Text

```
Container:  flex items-center gap-3 min-w-0
```

| Element         | Token / Class                                                      | Notes                              |
| --------------- | ------------------------------------------------------------------ | ---------------------------------- |
| **Icon circle** | `h-10 w-10 shrink-0 rounded-full flex items-center justify-center` | Background color varies by type    |
| Icon glyph      | `h-5 w-5` Lucide icon, color matches circle's scheme               | See icon mapping below             |
| **Wallet name** | `text-sm font-medium text-foreground truncate`                     | e.g., "Chase Checking"             |
| **Subtitle**    | `text-xs text-muted-foreground truncate`                           | Institution, account mask, or note |

#### Right: Edit Button

```tsx
<Button variant="ghost" size="icon-sm" onClick={handleEdit} aria-label={`Edit ${wallet.name}`}>
  <Pencil className="text-muted-foreground h-3.5 w-3.5" />
</Button>
```

Touch target: `icon-sm` gives at least 32x32, but add `min-h-[44px] min-w-[44px]` for WCAG compliance.

### 6.4 Icon Circle Color Mapping

The screenshot shows different colored icon backgrounds per wallet type. Map these to the existing theme tokens to avoid hardcoded colors:

| Wallet Type  | Circle Background | Icon Color     | Lucide Icon  |
| ------------ | ----------------- | -------------- | ------------ |
| `checking`   | `bg-chart-1/15`   | `text-chart-1` | `Landmark`   |
| `savings`    | `bg-income/15`    | `text-income`  | `PiggyBank`  |
| `cash`       | `bg-chart-2/15`   | `text-chart-2` | `Banknote`   |
| `credit`     | `bg-expense/15`   | `text-expense` | `CreditCard` |
| `investment` | `bg-chart-3/15`   | `text-chart-3` | `TrendingUp` |

The `/15` suffix creates a 15% opacity background tint, consistent with the badge pattern used in the change indicator. This keeps the icon circles within the design system rather than using arbitrary hex values.

### 6.5 Row 2: Balance Section

```
Container:  mt-3 flex items-end justify-between gap-4
```

#### Left: Balance

| Element            | Token / Class                      | Notes                              |
| ------------------ | ---------------------------------- | ---------------------------------- |
| **Balance label**  | `text-xs text-muted-foreground`    | Varies by type (see mapping below) |
| **Balance amount** | `text-xl font-bold tracking-tight` | Uses `formatCurrency()`            |
| Positive balance   | `text-foreground`                  | Default white text                 |
| Negative balance   | `text-expense`                     | Red for loans/credit               |

#### Balance Label Mapping

| Wallet Type  | Label                 |
| ------------ | --------------------- |
| `checking`   | "Available Balance"   |
| `savings`    | "Total Savings"       |
| `cash`       | "Cash on Hand"        |
| `credit`     | "Outstanding Balance" |
| `investment` | "Current Value"       |

#### Right: Sparkline

A small inline trend chart showing balance history for the current month.

```
Container:  w-16 h-8 shrink-0
```

| Element          | Spec                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| **Chart type**   | Recharts `<AreaChart>` or `<LineChart>` (no axes, no labels, no tooltip)         |
| **Dimensions**   | 64x32px (`w-16 h-8`)                                                             |
| **Stroke**       | Positive: `var(--color-chart-1)` (green). Negative: `var(--color-expense)` (red) |
| **Stroke width** | 1.5px                                                                            |
| **Fill**         | Translucent gradient matching stroke color, 20% to 0% opacity                    |
| **Data**         | `BalanceHistoryEntry[]` from `useWalletHistory()` for the selected month         |
| **Fallback**     | If no history data, render nothing (empty `<div>`)                               |

### 6.6 Full Card Click

Clicking anywhere on the card (except the edit button) navigates to `/wallets/:id`. The edit button should call `e.stopPropagation()` to prevent navigation.

---

## 7. Wallet Group Sections

The screenshot shows wallets appearing in groups. Group wallets by `walletType` and render each group with a section header.

### 7.1 Grouping Logic

Client-side grouping of the filtered wallet list:

```ts
const WALLET_TYPE_ORDER: WalletType[] = ['checking', 'savings', 'cash', 'investment', 'credit'];

const grouped = WALLET_TYPE_ORDER.map((type) => ({
  type,
  wallets: filteredWallets.filter((w) => w.walletType === type),
})).filter((group) => group.wallets.length > 0);
```

### 7.2 Group Header

```
Container:  px-4 pt-4 pb-2
```

The screenshot does not prominently show group headers, but the repeated "Outstanding Balance" label at the bottom suggests grouping. For clarity, add subtle section dividers:

| Element         | Token / Class                                                        |
| --------------- | -------------------------------------------------------------------- |
| **Group title** | `text-xs font-medium tracking-wider uppercase text-muted-foreground` |

Group titles: "Checking", "Savings", "Cash", "Investments", "Credit & Loans".

### 7.3 Card List Within Group

```
Container:  space-y-3 px-4
```

Each `<WalletCard />` stacks vertically with 12px gap (`space-y-3`).

### 7.4 Add Wallet Button Per Group

Each group gets its own "+ Add New Wallet" button at the bottom (see Section 8). When "All" filter is active, show a single add button at the very bottom instead of per-group buttons.

### 7.5 Screenshot Drift: Duplicate Section

The screenshot shows what appears to be a duplicated section at the bottom (a second "Outstanding Balance" group with identical cards). This is likely a scroll artifact from the screenshot tool or test data duplication. The implementation should **not** duplicate groups. Each wallet appears exactly once.

---

## 8. Add New Wallet CTA

**Location:** Bottom of the wallet list (or bottom of each group when a filter is active).

### 8.1 Token Mapping

```tsx
<Button
  variant="outline"
  className="w-full gap-2 rounded-xl border-dashed"
  onClick={() => setFormOpen(true)}
>
  <Plus className="h-4 w-4" />
  Add New Wallet
</Button>
```

| Element       | Token / Class                                                |
| ------------- | ------------------------------------------------------------ |
| **Container** | `w-full rounded-xl border-dashed`                            |
| **Height**    | Default button height (40px) via `h-10` from variant         |
| **Text**      | `text-sm font-medium text-muted-foreground`                  |
| **Icon**      | `<Plus className="h-4 w-4" />`                               |
| **Border**    | `border-border` (uses `--border` token: `oklch(1 0 0 / 8%)`) |
| **Hover**     | `hover:bg-accent hover:text-accent-foreground`               |

### 8.2 Spacing

```
Container:  px-4 pt-3 pb-2
```

---

## 9. Skeleton Loading State

When `isLoading` is true, render placeholder skeletons that match the final layout shape.

### 9.1 Structure

```
<div className="pb-6">
  <!-- Header skeleton -->
  <div className="px-4 pt-4 pb-2 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-28" />
    </div>
    <Skeleton className="h-8 w-8 rounded-lg" />
  </div>
  <div className="px-4 pt-1 pb-4 flex items-center justify-between">
    <Skeleton className="h-7 w-24" />
    <Skeleton className="h-8 w-28 rounded-full" />
  </div>

  <!-- Net worth skeleton -->
  <div className="px-4 pb-4 space-y-2">
    <Skeleton className="h-3 w-32" />
    <Skeleton className="h-9 w-44" />
  </div>

  <!-- Filter tabs skeleton -->
  <div className="px-4 pb-4 flex gap-2">
    <Skeleton className="h-9 w-14 rounded-full" />
    <Skeleton className="h-9 w-16 rounded-full" />
    <Skeleton className="h-9 w-16 rounded-full" />
    <Skeleton className="h-9 w-24 rounded-full" />
  </div>

  <!-- Card skeletons -->
  <div className="space-y-3 px-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
    ))}
  </div>
</div>
```

### 9.2 Skeleton Token

Skeletons use the existing `<Skeleton>` component which applies `bg-muted animate-pulse rounded-md`.

---

## 10. Empty & Error States

### 10.1 Empty State (No Wallets)

```
Container:  flex flex-col items-center justify-center gap-4 px-4 pt-20 text-center
```

| Element         | Token / Class                                                    |
| --------------- | ---------------------------------------------------------------- |
| **Icon**        | `<WalletCards className="h-12 w-12 text-muted-foreground/50" />` |
| **Heading**     | `text-base font-semibold text-foreground`                        |
| **Description** | `text-sm text-muted-foreground max-w-[240px]`                    |
| **CTA**         | `<Button>` primary, "Create Your First Wallet"                   |

Content: "No wallets yet" / "Create a wallet to start tracking your finances."

### 10.2 Empty Filter Result

When a filter tab is selected but no wallets match:

```
<div className="py-12 text-center">
  <p className="text-sm text-muted-foreground">No {filterLabel} wallets</p>
</div>
```

### 10.3 Error State

Keep the existing error pattern:

```tsx
<div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
  <p className="text-destructive text-sm">Failed to load wallets</p>
  <Button variant="link" onClick={() => refetch()}>
    Try again
  </Button>
</div>
```

---

## 11. Interaction & Animation

### 11.1 Card Press

| Property       | Value                         | Rationale                             |
| -------------- | ----------------------------- | ------------------------------------- |
| **Hover**      | `hover:bg-accent/50`          | Subtle surface shift on desktop hover |
| **Active**     | `active:scale-[0.98]`         | Micro-scale for tactile feedback      |
| **Transition** | `transition-all duration-150` | 150ms is fast enough to feel instant  |

### 11.2 Filter Tab Switch

| Property         | Value                            |
| ---------------- | -------------------------------- |
| Color transition | `transition-colors duration-150` |
| List re-render   | No animation (instant filter)    |

### 11.3 Sparkline

| Property   | Value                                             |
| ---------- | ------------------------------------------------- |
| Entry anim | None (renders with data, no entrance)             |
| Hover      | None (sparklines are decorative, not interactive) |

### 11.4 Page Entry

No page-level entrance animation. Content renders immediately or shows skeletons.

### 11.5 Add Wallet Sheet

Opens the existing `<WalletForm>` bottom sheet. The sheet already has enter/exit animations via shadcn's `Sheet` component.

---

## 12. Responsive Behavior

This is a mobile-first PWA. The wallets screen is designed for a single-column layout.

### 12.1 Breakpoints

| Breakpoint | Behavior                                             |
| ---------- | ---------------------------------------------------- |
| < 640px    | Default mobile layout. Full-width cards, px-4 gutter |
| >= 640px   | Optional: constrain max-width to 480px, center       |
| >= 1024px  | Optional: 2-column card grid within groups           |

For the initial implementation, focus on mobile only. Wrap the page in `max-w-lg mx-auto` if desired for tablet/desktop centering.

### 12.2 Horizontal Scroll (Filter Tabs)

Filter tabs scroll horizontally without a visible scrollbar. Use `overflow-x-auto` with the `scrollbar-none` utility (Tailwind v4 includes this). On wider screens where all tabs fit, they simply sit left-aligned.

### 12.3 Text Truncation

- Wallet name: `truncate` (single line, ellipsis)
- Subtitle: `truncate` (single line, ellipsis)
- Balance: Never truncates. Use `whitespace-nowrap` to prevent wrapping.

---

## 13. Accessibility

### 13.1 Semantic Structure

```html
<main>
  <!-- from AppShell -->
  <header>
    <!-- greeting + title -->
    <h1>Wallets</h1>
  </header>
  <section aria-label="Net worth summary">...</section>
  <nav aria-label="Wallet type filter">
    <button role="tab" aria-selected="true">All</button>
    <button role="tab" aria-selected="false">Liquid</button>
    ...
  </nav>
  <section aria-label="Checking wallets">
    <h2>Checking</h2>
    <article>...</article>
    <!-- each wallet card -->
  </section>
  ...
</main>
```

### 13.2 ARIA

| Element          | ARIA                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- | ------- |
| Filter tab group | `role="tablist"` on container                                                            |
| Each tab         | `role="tab"`, `aria-selected="true                                                       | false"` |
| Wallet card      | `role="article"` or semantic `<article>`, `aria-label="{wallet name}, balance {amount}"` |
| Edit button      | `aria-label="Edit {wallet name}"`                                                        |
| Sparkline        | `aria-hidden="true"` (decorative)                                                        |
| Add wallet btn   | Clear label, no additional ARIA needed                                                   |

### 13.3 Keyboard Navigation

- Tab order: Settings icon -> Month picker -> Filter tabs (left/right arrow within tablist) -> Wallet cards (enter to navigate) -> Edit buttons -> Add wallet button.
- Filter tabs support arrow key navigation within the `role="tablist"`.
- Cards are focusable (`tabIndex={0}`) with `onKeyDown` handler for Enter/Space to navigate.

### 13.4 Focus Indicators

All interactive elements use the existing `outline-ring/50` base style. Verify focus rings are visible on:

- Filter tab pills
- Wallet cards
- Edit buttons
- Add wallet button

### 13.5 Contrast

All text pairings verified against the existing contrast table in the dashboard redesign spec (Section 1.4). Key pairings for this screen:

| Foreground             | Background  | Ratio | Status |
| ---------------------- | ----------- | ----- | ------ |
| `--foreground`         | `--card`    | ~14:1 | Pass   |
| `--muted-foreground`   | `--card`    | ~5:1  | Pass   |
| `--expense`            | `--card`    | ~7:1  | Pass   |
| `--income`             | `--card`    | ~8:1  | Pass   |
| `--primary-foreground` | `--primary` | ~7:1  | Pass   |

### 13.6 Screen Reader Announcements

When the filter changes, announce the result count:

```tsx
<div aria-live="polite" className="sr-only">
  {`Showing ${filteredWallets.length} wallet${filteredWallets.length !== 1 ? 's' : ''}`}
</div>
```

---

## 14. Data Mapping

### 14.1 API Types to UI

| UI Element         | API Source                                   | Transform                                  |
| ------------------ | -------------------------------------------- | ------------------------------------------ |
| Wallet name        | `Wallet.name`                                | Direct                                     |
| Subtitle           | `Wallet.walletType` + `Wallet.accountNumber` | `"{TypeLabel} · ····{last4}"`              |
| Balance            | `Wallet.balance`                             | `formatCurrency(balance, currency)`        |
| Balance sign color | `Wallet.balance`                             | `< 0 ? 'text-expense' : 'text-foreground'` |
| Icon               | `Wallet.walletType`                          | `walletTypeConfig[type].icon`              |
| Balance label      | `Wallet.walletType`                          | `walletTypeConfig[type].balanceLabel`      |
| Sparkline data     | `BalanceHistoryEntry[]`                      | `useWalletHistory(id, start, end)`         |
| Net worth          | Sum of `Wallet.balance` across all wallets   | Client-side sum, `formatCurrency()`        |
| Month-over-month % | Dashboard API `netWorth` (current vs prior)  | `((current - prior) / abs(prior)) * 100`   |

### 14.2 Query Keys

| Hook                      | Query Key                                            |
| ------------------------- | ---------------------------------------------------- |
| `useWallets(type?)`       | `['wallets', { type }]`                              |
| `useWalletHistory(id)`    | `['wallets', id, 'history', { startDate, endDate }]` |
| Dashboard (for net worth) | `['dashboard', { year, month }]`                     |

### 14.3 Account Number Masking

The screenshot shows `····4521`. If `Wallet.accountNumber` exists, display the last 4 characters with a masked prefix:

```ts
function maskAccountNumber(acct: string): string {
  const last4 = acct.slice(-4);
  return `····${last4}`;
}
```

### 14.4 Subtitle Construction

```ts
function getSubtitle(wallet: Wallet): string {
  const typeLabel = walletTypeConfig[wallet.walletType]?.label ?? 'Account';
  const acctMask = wallet.accountNumber ? ` · ${maskAccountNumber(wallet.accountNumber)}` : '';
  return `${typeLabel}${acctMask}`;
}
```

Note: The screenshot shows custom subtitles like "Bitcoin & ETH" and "Marcus by Goldman" which suggest a `description` or `institution` field not present in the current API `Wallet` type. If the API is extended to include these fields, use them. Otherwise, fall back to the type label + account number pattern above.

---

## 15. Design Drift & Recommendations

Areas where this spec intentionally deviates from the screenshot to improve consistency, accessibility, or UX.

### 15.1 Color Consistency

**Screenshot issue:** The icon circles in the screenshot use various blues, oranges, and greens that do not align with the green-tinted dark theme.

**Recommendation:** Use the existing chart color scale (`chart-1` through `chart-5`) and semantic tokens (`income`, `expense`) for icon circle backgrounds. This keeps the palette cohesive and avoids introducing off-brand colors. See Section 6.4 for the mapping.

### 15.2 Sparkline Colors

**Screenshot issue:** The sparklines use blue and red strokes, with blue being off-palette.

**Recommendation:** Use `chart-1` (green) for positive-balance wallets and `expense` (red/coral) for negative-balance wallets. This maps to the existing semantic meaning: green = healthy, red = debt.

### 15.3 "Outstanding Balance" Label Reuse

**Screenshot issue:** Both "Student Loan" and "High Yield Savings" (the 4th card) show "Outstanding Balance" as the label. The savings card should show "Total Savings", not "Outstanding Balance".

**Recommendation:** Balance labels are derived from `walletType`, not manually set. The mapping in Section 6.5 ensures correctness.

### 15.4 Duplicate Bottom Section

**Screenshot issue:** The bottom of the screenshot shows what appears to be a duplicated group of cards.

**Recommendation:** This is likely a screenshot artifact. Each wallet renders once. No duplicate sections.

### 15.5 Currency Symbol

**Screenshot issue:** The screenshot uses the Rupee symbol (Rs.) inconsistently -- sometimes with decimals, sometimes without.

**Recommendation:** Always use `formatCurrency()` which produces consistent output via `Intl.NumberFormat` with `minimumFractionDigits: 2`. The net worth summary amount can optionally omit decimals for visual cleanliness at large values by using a separate formatter:

```ts
function formatCurrencyCompact(amountInMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInMinorUnits / 100);
}
```

Use this for the net worth hero number only. Individual card balances retain full precision.

### 15.6 Edit Icon Placement

**Screenshot issue:** The edit pencil icon sits at the top-right of each card, which could be accidentally tapped when scrolling.

**Recommendation:** Keep the edit icon but ensure adequate spacing. The `min-w-[44px]` touch target combined with `items-start` alignment (not `items-center`) prevents the icon from sitting in the middle of the scroll gesture path. Consider using the existing `onClick -> navigate` pattern for the card body and reserving edit for the wallet detail page to reduce accidental taps. However, since the screenshot explicitly shows it, include it with proper `stopPropagation`.

### 15.7 Net Worth Change Percentage

**Screenshot issue:** Shows "up 2.4%" which implies month-over-month comparison.

**Recommendation:** The current API does not provide a direct month-over-month net worth comparison. Options:

1. Fetch dashboard data for current and previous month, compute delta. This requires two API calls.
2. Add a dedicated API endpoint for net worth trend.
3. Omit the badge until the API supports it (cleanest approach).

**Decision:** Implement the UI component for the badge but conditionally render it only when comparison data is available. Do not fabricate percentages.

### 15.8 Filter Tab Touch Targets

**Screenshot issue:** The "All" tab appears small in the screenshot.

**Recommendation:** Enforce `min-h-[36px] min-w-[48px]` on all tab pills. The "All" label is short, so without min-width it would be an uncomfortably small target. 48px width ensures comfortable tapping on mobile.

---

## Appendix A: Component File Map

| Component               | File Path                                     | New/Modified |
| ----------------------- | --------------------------------------------- | ------------ |
| `WalletsPage`           | `src/features/wallets/page.tsx`               | Modified     |
| `WalletsHeader`         | `src/features/wallets/wallets-header.tsx`     | New          |
| `NetWorthSummary`       | `src/features/wallets/net-worth-summary.tsx`  | New          |
| `WalletFilterTabs`      | `src/features/wallets/wallet-filter-tabs.tsx` | New          |
| `WalletCard`            | `src/features/wallets/wallet-card.tsx`        | Modified     |
| `WalletSparkline`       | `src/features/wallets/wallet-sparkline.tsx`   | New          |
| `PageHeader` (optional) | `src/components/layout/page-header.tsx`       | New          |
| `ChangeBadge`           | `src/components/change-badge.tsx`             | New          |

## Appendix B: New Utility Functions

| Function                  | File                                   | Purpose                             |
| ------------------------- | -------------------------------------- | ----------------------------------- |
| `maskAccountNumber()`     | `src/lib/currency.ts`                  | `····{last4}` display               |
| `formatCurrencyCompact()` | `src/lib/currency.ts`                  | No-decimal format for hero numbers  |
| `getBalanceLabel()`       | `src/features/wallets/wallet-card.tsx` | Type-to-label mapping               |
| `getSubtitle()`           | `src/features/wallets/wallet-card.tsx` | Construct subtitle from wallet data |

## Appendix C: Updated `walletTypeConfig`

```ts
const walletTypeConfig: Record<
  WalletType,
  {
    icon: LucideIcon;
    label: string;
    balanceLabel: string;
    iconBg: string; // Tailwind class for circle background
    iconColor: string; // Tailwind class for icon glyph
  }
> = {
  checking: {
    icon: Landmark,
    label: 'Checking',
    balanceLabel: 'Available Balance',
    iconBg: 'bg-chart-1/15',
    iconColor: 'text-chart-1',
  },
  savings: {
    icon: PiggyBank,
    label: 'Savings',
    balanceLabel: 'Total Savings',
    iconBg: 'bg-income/15',
    iconColor: 'text-income',
  },
  cash: {
    icon: Banknote,
    label: 'Cash',
    balanceLabel: 'Cash on Hand',
    iconBg: 'bg-chart-2/15',
    iconColor: 'text-chart-2',
  },
  credit: {
    icon: CreditCard,
    label: 'Credit & Loans',
    balanceLabel: 'Outstanding Balance',
    iconBg: 'bg-expense/15',
    iconColor: 'text-expense',
  },
  investment: {
    icon: TrendingUp,
    label: 'Investments',
    balanceLabel: 'Current Value',
    iconBg: 'bg-chart-3/15',
    iconColor: 'text-chart-3',
  },
};
```
