# Dashboard Redesign -- Design Specification

**Date:** 2026-04-04
**Status:** Draft
**Scope:** Color system overhaul, header redesign, month selector sheet, dashboard layout, bottom nav with FAB

---

## Table of Contents

1. [Color System Overhaul](#1-color-system-overhaul)
2. [App Shell Changes](#2-app-shell-changes)
3. [Header Redesign](#3-header-redesign)
4. [Month Selector Bottom Sheet](#4-month-selector-bottom-sheet)
5. [Dashboard Page Layout](#5-dashboard-page-layout)
6. [Net Worth Card](#6-net-worth-card)
7. [Income / Spent Row](#7-income--spent-row)
8. [Monthly Budget Card](#8-monthly-budget-card)
9. [Recent Transactions Section](#9-recent-transactions-section)
10. [Bottom Navigation with FAB](#10-bottom-navigation-with-fab)
11. [Skeleton Loading States](#11-skeleton-loading-states)
12. [Accessibility Checklist](#12-accessibility-checklist)

---

## 1. Color System Overhaul

The entire app shifts from neutral gray dark mode to a **deep green-tinted** dark palette. Every `.dark` token in `src/styles/globals.css` must be updated. Light mode tokens remain unchanged (they are a fallback; the app ships dark-first).

### 1.1 New `.dark` CSS Custom Properties

The hue channel for greens sits around `145-155` in oklch. The strategy: backgrounds use very low chroma greens (near-black with a green tint), cards use slightly elevated chroma, and accent/primary become a vivid emerald.

```
/* ── Backgrounds ───────────────────────────────────────── */
--background:            oklch(0.13 0.015 155);    /* deep black-green, page bg */
--foreground:            oklch(0.985 0 0);         /* near-white text */

/* ── Cards ─────────────────────────────────────────────── */
--card:                  oklch(0.18 0.02 155);     /* slightly lighter green-tinted surface */
--card-foreground:       oklch(0.985 0 0);

/* ── Popover / Sheet ───────────────────────────────────── */
--popover:               oklch(0.18 0.02 155);     /* same as card */
--popover-foreground:    oklch(0.985 0 0);

/* ── Primary (vivid emerald green) ─────────────────────── */
--primary:               oklch(0.72 0.19 155);     /* bright green for accents, active states */
--primary-foreground:    oklch(0.13 0.015 155);    /* dark bg color for text on primary buttons */

/* ── Secondary ─────────────────────────────────────────── */
--secondary:             oklch(0.22 0.025 155);    /* elevated green surface */
--secondary-foreground:  oklch(0.985 0 0);

/* ── Muted ─────────────────────────────────────────────── */
--muted:                 oklch(0.22 0.025 155);    /* same as secondary — subdued surfaces */
--muted-foreground:      oklch(0.65 0.03 155);     /* de-emphasized text, green-tinted gray */

/* ── Accent ────────────────────────────────────────────── */
--accent:                oklch(0.22 0.025 155);
--accent-foreground:     oklch(0.985 0 0);

/* ── Destructive (unchanged hue, just verify contrast) ── */
--destructive:           oklch(0.704 0.191 22.216);

/* ── Borders & Input ───────────────────────────────────── */
--border:                oklch(1 0 0 / 8%);        /* subtle white overlay border */
--input:                 oklch(1 0 0 / 12%);       /* slightly more visible for inputs */
--ring:                  oklch(0.72 0.19 155);      /* matches primary for focus rings */

/* ── Income / Expense (keep existing, they work well) ─── */
--income:                oklch(0.75 0.18 145);     /* unchanged */
--expense:               oklch(0.72 0.19 25);      /* unchanged */

/* ── Charts (shift to green palette) ───────────────────── */
--chart-1:               oklch(0.72 0.19 155);     /* primary green */
--chart-2:               oklch(0.60 0.14 155);
--chart-3:               oklch(0.48 0.10 155);
--chart-4:               oklch(0.36 0.07 155);
--chart-5:               oklch(0.24 0.04 155);
```

### 1.2 New Semantic Tokens (add to both `:root` and `.dark`)

These new tokens support the redesigned dashboard. Add them to the `@theme inline` block AND define values in `.dark`.

```
/* Add to @theme inline block */
--color-surface-elevated: var(--surface-elevated);
--color-accent-soft:      var(--accent-soft);
--color-accent-soft-foreground: var(--accent-soft-foreground);

/* .dark values */
--surface-elevated:          oklch(0.20 0.025 155);    /* for cards that need a step above --card */
--accent-soft:               oklch(0.72 0.19 155 / 12%); /* translucent primary for icon bg circles */
--accent-soft-foreground:    oklch(0.72 0.19 155);       /* primary green for text/icons on accent-soft */

/* :root (light mode) values — define reasonable fallbacks */
--surface-elevated:          oklch(0.97 0 0);
--accent-soft:               oklch(0.205 0 0 / 8%);
--accent-soft-foreground:    oklch(0.205 0 0);
```

### 1.3 Radius Token

No changes needed. The existing `--radius: 0.625rem` (10px) is fine. Cards use `rounded-xl` (12px from Tailwind) which pairs well.

### 1.4 Contrast Verification

All text pairings must meet WCAG AA 4.5:1 minimum:

| Foreground                  | Background            | Expected Ratio | Status |
| --------------------------- | --------------------- | -------------- | ------ |
| `--foreground` (0.985)      | `--background` (0.13) | ~15:1          | Pass   |
| `--muted-foreground` (0.65) | `--background` (0.13) | ~6.5:1         | Pass   |
| `--muted-foreground` (0.65) | `--card` (0.18)       | ~5:1           | Pass   |
| `--primary` (0.72)          | `--card` (0.18)       | ~7:1           | Pass   |
| `--income` (0.75)           | `--card` (0.18)       | ~8:1           | Pass   |
| `--expense` (0.72)          | `--card` (0.18)       | ~7:1           | Pass   |

---

## 2. App Shell Changes

**File:** `src/components/layout/app-shell.tsx`

### Current

```
<div className="flex min-h-dvh flex-col bg-background">
  <Header />                           ← sticky header
  <main className="flex-1 overflow-y-auto pb-20 pt-4">
    <Outlet />
  </main>
  <BottomNav />
</div>
```

### Target

The header is no longer a fixed/sticky element. It scrolls with content. The `<Header>` component is removed from the shell entirely -- each page owns its own header area (the dashboard page will render the greeting + month selector inline). This gives pages full control over scroll behavior.

```
<div className="flex min-h-dvh flex-col bg-background">
  <main className="flex-1 overflow-y-auto pb-24">   ← increased pb for taller bottom nav with FAB
    <Outlet />
  </main>
  <BottomNav />
</div>
```

**Key changes:**

- Remove `<Header />` import and render.
- Change `pb-20` to `pb-24` (96px) to clear the bottom nav + FAB.
- Remove `pt-4` -- each page handles its own top padding.

### Consideration for Other Pages

Pages like `/wallets` and `/wallets/:id` that currently rely on the shared header will need their own header treatment. This spec focuses on the dashboard page; other pages should adopt a similar inline-header pattern with a page-specific title.

---

## 3. Header Redesign

The current `<Header>` component (`src/components/layout/header.tsx`) is **retired** as a shared layout component. Its responsibilities move into individual pages.

### 3.1 Dashboard Header Area

**File:** New component `src/features/dashboard/dashboard-header.tsx`

This is NOT a separate fixed component. It renders inline at the top of the dashboard page scroll area.

#### Row 1: Greeting Bar

```
Container:  px-4 pt-[env(safe-area-inset-top)] (add safe area for notch)
Inner:      flex items-center justify-between pt-4 pb-2
```

| Element           | Spec                                                                                                                                                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Avatar**        | `<Avatar size="default">` (32x32). Uses `<AvatarFallback>` with user initial (from Auth0 `user.name`). Fallback: `bg-primary text-primary-foreground text-sm font-semibold`.                                                                                                                                                  |
| **Greeting text** | `text-sm text-muted-foreground ml-3` next to avatar. Content: time-based ("Good Morning,", "Good Afternoon,", "Good Evening,").                                                                                                                                                                                               |
| **Settings icon** | `<Button variant="ghost" size="icon">` wrapping `<Settings className="h-5 w-5" />`. Touch target: already 32x32 via `size-8`, with the `min-w-[44px] min-h-[44px]` padding trick from icon-sm, OR use `size="icon"` which gives `size-8` and add explicit `min-h-[44px] min-w-[44px]`. Links to `/profile` or opens settings. |

**Greeting logic (utility function):**

```
hour < 12  → "Good Morning,"
hour < 17  → "Good Afternoon,"
else       → "Good Evening,"
```

#### Row 2: Title + Month Pill

```
Container:  flex items-center justify-between px-4 pt-1 pb-4
```

| Element               | Spec                                                                                                                                                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Dashboard" title** | `text-2xl font-bold text-foreground`. Plain text, no icon.                                                                                                                                                                                                                                      |
| **Month pill**        | Triggers the month selector bottom sheet (Section 4). Rendered as a `<Button variant="outline" size="sm">` with `rounded-full` override. Content: `{formatMonthYear(year, month)}` + `<ChevronDown className="h-3.5 w-3.5 ml-1" />`. Classes: `rounded-full border-border text-sm font-medium`. |

#### Safe Area Handling

The outermost container of the dashboard page must account for `safe-area-inset-top` since there is no sticky header absorbing it. Apply:

```
pt-[env(safe-area-inset-top)]
```

on the page wrapper, or use `pt-[max(env(safe-area-inset-top),16px)]` to ensure a minimum 16px padding even on devices without a notch.

---

## 4. Month Selector Bottom Sheet

**File:** `src/components/month-selector.tsx` -- complete rewrite.

The current inline chevron-based selector becomes two parts:

1. A **trigger** (the pill button described in Section 3.1, Row 2).
2. A **bottom sheet** using the existing `Sheet` component with `side="bottom"`.

### 4.1 Trigger Component

Exported as `<MonthSelectorTrigger />`. This is the pill button that opens the sheet.

```
<SheetTrigger>
  <Button variant="outline" size="sm" className="rounded-full gap-1.5">
    {formatMonthYear(year, month)}
    <ChevronDown className="h-3.5 w-3.5" />
  </Button>
</SheetTrigger>
```

### 4.2 Sheet Structure

```
<Sheet>
  <MonthSelectorTrigger />
  <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl max-h-[60dvh]">
    {/* Drag handle */}
    <div className="flex justify-center pt-3 pb-1">
      <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
    </div>

    {/* Header row */}
    <SheetHeader className="flex-row items-center justify-between px-4 pb-0">
      <SheetTitle className="text-lg font-semibold">Select Month</SheetTitle>
      <SheetClose>
        <Button variant="ghost" size="icon-sm">
          <X className="h-4 w-4" />
        </Button>
      </SheetClose>
    </SheetHeader>

    <Separator className="mx-4" />

    {/* Scrollable month list */}
    <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
      {months.map(m => <MonthRow ... />)}
    </div>
  </SheetContent>
</Sheet>
```

### 4.3 Sheet Sizing

- `rounded-t-2xl` on SheetContent for the rounded top corners.
- `max-h-[60dvh]` to prevent it from covering the full screen.
- `pb-[env(safe-area-inset-bottom)]` at the bottom of the scrollable area for home-bar clearance.

### 4.4 Month Row

Each row is a button. Generate months from current month back 24 months (2 years of history).

```
Container: w-full rounded-xl px-4 py-3 min-h-[44px]
           flex items-center justify-between
           transition-colors

Unselected: bg-card text-foreground
Selected:   bg-card ring-1 ring-primary text-primary
```

| Element         | Unselected                            | Selected                                     |
| --------------- | ------------------------------------- | -------------------------------------------- |
| **Month label** | `text-sm font-medium text-foreground` | `text-sm font-medium text-primary`           |
| **Check icon**  | Hidden                                | `<Check className="h-4 w-4 text-primary" />` |
| **Background**  | `bg-card`                             | `bg-card`                                    |
| **Border**      | `ring-1 ring-transparent`             | `ring-1 ring-primary`                        |

### 4.5 Month List Data

```ts
function generateMonthList(): Array<{ year: number; month: number; label: string }> {
  // Generate from current month back 24 months
  // Newest first (descending)
  // Use formatMonthYear() for labels: "Apr 2026", "Mar 2026", etc.
  // Short format for list: format(date, "MMM yyyy")
}
```

### 4.6 Interaction

- Tapping a month calls `useMonthStore.setMonth(year, month)` and closes the sheet.
- Future months must not appear in the list (respect `isFutureMonth` check).
- The list should auto-scroll to bring the selected month into view on open (use `scrollIntoView` or a ref on the selected item).

---

## 5. Dashboard Page Layout

**File:** `src/features/dashboard/page.tsx`

### Overall Structure

```
<div className="pt-[max(env(safe-area-inset-top),16px)]">
  <DashboardHeader />                        ← Section 3
  <div className="space-y-4 px-4 pb-4">
    <NetWorthCard ... />                     ← Section 6
    <div className="grid grid-cols-2 gap-3">
      <IncomeCard ... />                     ← Section 7
      <SpentCard ... />                      ← Section 7
    </div>
    <MonthlyBudgetCard ... />                ← Section 8
    <RecentTransactionsSection ... />        ← Section 9
  </div>
</div>
```

### Spacing System

| Gap              | Value       | Usage                                    |
| ---------------- | ----------- | ---------------------------------------- |
| Page horizontal  | `px-4`      | 16px. All content inset.                 |
| Section vertical | `space-y-4` | 16px between cards.                      |
| Card internal    | `p-4`       | 16px padding inside cards.               |
| Income/Spent gap | `gap-3`     | 12px between the two side-by-side cards. |

### Component Inventory (what changes from current)

| Current Component        | Action  | New Component                                         |
| ------------------------ | ------- | ----------------------------------------------------- |
| `<Header />`             | Remove  | `<DashboardHeader />`                                 |
| `<MonthSelector />`      | Rewrite | `<MonthSelectorSheet />`                              |
| `<IncomeExpenseCard />`  | Split   | `<NetWorthCard />`, `<IncomeCard />`, `<SpentCard />` |
| `<WalletSummary />`      | Remove  | Dropped from dashboard (wallets page owns this)       |
| `<RecentTransactions />` | Restyle | `<RecentTransactionsSection />`                       |
| (new)                    | Create  | `<MonthlyBudgetCard />`                               |

---

## 6. Net Worth Card

**File:** `src/features/dashboard/net-worth-card.tsx` (new)

### Layout

```
<Card className="overflow-hidden">
  <CardContent className="p-4">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        {/* Icon badge */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
          <IndianRupee className="h-5 w-5 text-accent-soft-foreground" />
        </div>
        {/* Label */}
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Total Net Worth
        </p>
        {/* Amount */}
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {formatCurrency(netWorth, currency)}
        </p>
      </div>
    </div>
    {/* Change indicator row */}
    <div className="mt-3 flex items-center gap-2">
      <Badge variant="secondary" className="bg-accent-soft text-accent-soft-foreground gap-1">
        <TrendingUp className="h-3 w-3" />
        {percentageChange}%
      </Badge>
      <span className="text-xs text-muted-foreground">
        {changeDirection}{formatCurrency(Math.abs(absoluteChange), currency)} vs last month
      </span>
    </div>
  </CardContent>
</Card>
```

### Anatomy

| Element        | Classes                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Card           | Default `<Card>`. Background comes from `--card` token.                                                                                      |
| Icon badge     | `h-10 w-10 rounded-xl bg-accent-soft` (40x40, 12px radius)                                                                                   |
| Icon           | `h-5 w-5 text-accent-soft-foreground`. Use `IndianRupee` from lucide for INR, `DollarSign` for USD, etc. Dynamic based on `primaryCurrency`. |
| Label          | `text-xs font-medium tracking-wider text-muted-foreground uppercase`                                                                         |
| Amount         | `text-3xl font-bold text-foreground tracking-tight` (~30px)                                                                                  |
| Change badge   | `<Badge variant="secondary">` with custom `bg-accent-soft text-accent-soft-foreground`                                                       |
| Change subtext | `text-xs text-muted-foreground`                                                                                                              |

### Data Requirements

The current `DashboardResponse` does not include month-over-month change. Two options:

1. **Compute client-side:** Fetch previous month dashboard too and diff `netWorth`. Store previous month data with a separate query key.
2. **Static placeholder:** Show the badge only when change data is available. If the API does not provide it yet, omit the change row for now and show only the net worth.

**Recommendation:** Option 2 for initial implementation. Add a `TODO` comment for when the API supports month-over-month comparison. The card should gracefully hide the change indicator row when data is unavailable.

### Currency Icon Mapping

```ts
const currencyIconMap: Record<Currency, LucideIcon> = {
  INR: IndianRupee,
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
  JPY: JapaneseYen,
  AUD: DollarSign,
  CAD: DollarSign,
};
```

---

## 7. Income / Spent Row

**Files:** `src/features/dashboard/stat-card.tsx` (new shared component for both)

### Layout (each card)

```
<Card>
  <CardContent className="p-4">
    {/* Icon circle */}
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft">
      <ArrowDownLeft className="h-4 w-4 text-accent-soft-foreground" />  ← Income
      <ArrowUpRight className="h-4 w-4 text-accent-soft-foreground" />   ← Spent
    </div>
    {/* Label */}
    <p className="mt-2 text-xs text-muted-foreground">Income</p>
    {/* Amount */}
    <p className="mt-0.5 text-lg font-bold text-income">
      {formatCurrency(totalIncome, currency)}
    </p>
  </CardContent>
</Card>
```

### Anatomy

| Element        | Income Card                                           | Spent Card                                           |
| -------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Icon container | `h-9 w-9 rounded-full bg-accent-soft`                 | Same                                                 |
| Icon           | `ArrowDownLeft` `h-4 w-4 text-accent-soft-foreground` | `ArrowUpRight` `h-4 w-4 text-accent-soft-foreground` |
| Label          | `text-xs text-muted-foreground` "Income"              | `text-xs text-muted-foreground` "Spent"              |
| Amount         | `text-lg font-bold text-income`                       | `text-lg font-bold text-foreground`                  |

**Note on spent amount color:** The reference shows spent in white (`text-foreground`), not red. This is intentional -- the card context already communicates "spent", so coloring it red would be redundant visual noise. Income uses `text-income` (green) because green-on-green-card needs differentiation.

### Grid Container

```
<div className="grid grid-cols-2 gap-3">
  <StatCard type="income" ... />
  <StatCard type="spent" ... />
</div>
```

---

## 8. Monthly Budget Card

**File:** `src/features/dashboard/monthly-budget-card.tsx` (new)

### Data Source

Uses `BudgetSummaryResponse` from the existing budget summary API hook. Requires:

- `totalLimit` -- total budget limit
- `totalSpent` -- total spent against budgets
- `percentageConsumed` -- percentage used

### Layout

```
<Card>
  <CardContent className="p-4">
    {/* Title row */}
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-foreground">Monthly Budget</p>
      <p className="text-sm font-medium text-muted-foreground">{percentageConsumed}%</p>
    </div>

    {/* Progress bar */}
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${Math.min(percentageConsumed, 100)}%` }}
      />
    </div>

    {/* Remaining text */}
    <p className="mt-2 text-xs text-muted-foreground">
      {formatCurrency(remainingAmount, currency)} left to spend
    </p>
  </CardContent>
</Card>
```

### Anatomy

| Element        | Classes                                                    |
| -------------- | ---------------------------------------------------------- |
| Title          | `text-sm font-medium text-foreground`                      |
| Percentage     | `text-sm font-medium text-muted-foreground`                |
| Progress track | `h-1.5 w-full rounded-full bg-muted` (6px height)          |
| Progress fill  | `h-full rounded-full bg-primary` with inline `width` style |
| Remaining text | `text-xs text-muted-foreground`                            |

### Progress Bar Color Logic

| Condition                  | Fill Color       |
| -------------------------- | ---------------- |
| `percentageConsumed < 75`  | `bg-primary`     |
| `percentageConsumed < 90`  | `bg-yellow-500`  |
| `percentageConsumed >= 90` | `bg-destructive` |

### Edge Cases

- **No budgets set:** Show card with "No budgets configured" text and a "Set up budget" link (`text-primary`) pointing to `/budgets`.
- **Over budget:** Fill bar at 100%, percentage shows actual value (e.g., "112%"), remaining text changes to "{amount} over budget" in `text-destructive`.

---

## 9. Recent Transactions Section

**File:** `src/features/dashboard/recent-transactions.tsx` -- restyle (no card wrapper)

### Key Design Change

The reference does NOT wrap transactions in a `<Card>`. Instead:

1. A section header row sits directly on the page background.
2. Each transaction is its own card-like row.

### Section Header

```
<div className="flex items-center justify-between">
  <h2 className="text-base font-semibold text-foreground">Recent Transactions</h2>
  <Button variant="link" size="sm" className="text-primary h-auto p-0">
    View All
  </Button>
</div>
```

| Element    | Classes                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------- |
| Title      | `text-base font-semibold text-foreground`                                                     |
| "View All" | `<Button variant="link" size="sm">` with `text-primary h-auto p-0`. Links to `/transactions`. |

### Transaction Row

```
<div className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
  {/* Category icon */}
  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", meta.color)}>
    <Icon className="h-5 w-5 text-white" />
  </div>

  {/* Text block */}
  <div className="flex-1 min-w-0">
    <p className="truncate text-sm font-medium text-foreground">{tx.title}</p>
    <p className="text-xs text-muted-foreground">
      {meta.label} &middot; {walletName}
    </p>
  </div>

  {/* Amount + time */}
  <div className="text-right shrink-0">
    <p className={cn("text-sm font-semibold", isIncome ? "text-income" : "text-foreground")}>
      {isIncome ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), tx.currency)}
    </p>
    <p className="text-xs text-muted-foreground">
      {format(parseISO(tx.transactionDate), "h:mm a")}
    </p>
  </div>
</div>
```

### Anatomy

| Element              | Classes                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| Row container        | `flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10`          |
| Category icon circle | `h-10 w-10 rounded-full` + category `meta.color` (keep existing bg-green-700, etc.) |
| Icon                 | `h-5 w-5 text-white` (up from current h-4 w-4)                                      |
| Title                | `text-sm font-medium text-foreground truncate`                                      |
| Subtitle             | `text-xs text-muted-foreground` -- format: "{Category} . {Wallet Name}"             |
| Amount (income)      | `text-sm font-semibold text-income` prefixed with "+"                               |
| Amount (expense)     | `text-sm font-semibold text-foreground` prefixed with "-"                           |
| Time                 | `text-xs text-muted-foreground` -- format: "4:39 pm" (h:mm a)                       |

### Spacing

```
Section gap: space-y-3 (12px between header and first row, between rows)
```

### Data Requirement: Wallet Name

The current `DashboardTransaction` type does not include wallet name. Two options:

1. **Join client-side:** Cross-reference `tx.walletId` with the wallets list from `useWallets()`.
2. **Request API enhancement:** Add `walletName` to the dashboard transaction response.

**Recommendation:** Option 1 for now. Create a lookup map: `wallets.reduce((map, w) => { map[w.id] = w.name; return map; }, {})`.

### Empty State

```
<div className="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
  <p className="text-sm text-muted-foreground">No transactions this month</p>
</div>
```

---

## 10. Bottom Navigation with FAB

**File:** `src/components/layout/bottom-nav.tsx` -- significant rework.

### New Tab Configuration

```ts
const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/wallets', icon: WalletCards, label: 'Wallets' },
  // CENTER GAP for FAB
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: PiggyBank, label: 'Budget' },
];
```

**Changes from current:**

- 5 tabs reduced to 4 (Profile/User tab removed; accessible from settings icon in header).
- Labels: "Dashboard" becomes "Overview", "Txns" becomes "Transactions".
- Center slot reserved for FAB.

### Layout Structure

```
<nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border pb-[env(safe-area-inset-bottom)]">
  <div className="relative flex h-16 items-center justify-around px-2">
    {/* Left two tabs */}
    <NavTab ... />
    <NavTab ... />

    {/* Center FAB spacer */}
    <div className="w-16" />   ← reserves space so tabs spread evenly

    {/* Right two tabs */}
    <NavTab ... />
    <NavTab ... />

    {/* FAB - positioned absolutely to overlap the nav bar */}
    <button className="absolute left-1/2 -translate-x-1/2 -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-transform">
      <Plus className="h-6 w-6" />
    </button>
  </div>
</nav>
```

### FAB (Floating Action Button) Spec

| Property      | Value                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| Size          | `h-14 w-14` (56x56) -- exceeds 44px minimum touch target                                   |
| Position      | `absolute left-1/2 -translate-x-1/2 -top-5` (centered, 20px above nav top edge)            |
| Background    | `bg-primary` (`--primary` token)                                                           |
| Icon          | `<Plus className="h-6 w-6" />` in `text-primary-foreground`                                |
| Border radius | `rounded-full`                                                                             |
| Shadow        | `shadow-lg shadow-primary/25` -- green-tinted shadow for depth                             |
| Active state  | `active:scale-95 transition-transform` -- subtle press feedback                            |
| Interaction   | Opens transaction creation flow (navigate to `/transactions/new` or open a creation sheet) |

### Nav Tab Spec

```
<NavLink className={({ isActive }) => cn(
  "flex flex-col items-center gap-1 px-3 py-2 min-h-[44px] min-w-[44px] text-xs transition-colors",
  isActive ? "text-primary" : "text-muted-foreground"
)}>
  <Icon className="h-5 w-5" />
  <span>{label}</span>
</NavLink>
```

| State    | Text/Icon Color                                                   |
| -------- | ----------------------------------------------------------------- |
| Active   | `text-primary`                                                    |
| Inactive | `text-muted-foreground`                                           |
| Hover    | Not needed on mobile, but add `hover:text-foreground` for desktop |

### Accessibility

- FAB must have `aria-label="Add transaction"`.
- Nav links already get accessible names from their text content.
- The FAB should be reachable via keyboard tab order (it is a `<button>` so it is by default).

---

## 11. Skeleton Loading States

**File:** `src/features/dashboard/page.tsx` -- update the loading branch.

Match the new layout structure with skeleton placeholders.

```
<div className="pt-[max(env(safe-area-inset-top),16px)]">
  {/* Header skeleton */}
  <div className="px-4 pt-4 pb-2 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-28 rounded" />
    </div>
    <Skeleton className="h-8 w-8 rounded" />
  </div>
  <div className="px-4 pt-1 pb-4 flex items-center justify-between">
    <Skeleton className="h-7 w-36 rounded" />
    <Skeleton className="h-7 w-24 rounded-full" />
  </div>

  {/* Content skeleton */}
  <div className="space-y-4 px-4">
    <Skeleton className="h-40 w-full rounded-xl" />           ← Net worth
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-24 rounded-xl" />                ← Income
      <Skeleton className="h-24 rounded-xl" />                ← Spent
    </div>
    <Skeleton className="h-20 w-full rounded-xl" />           ← Budget
    <Skeleton className="h-4 w-40 rounded" />                 ← "Recent Transactions" label
    <div className="space-y-3">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  </div>
</div>
```

---

## 12. Accessibility Checklist

### Color & Contrast

- [ ] All text meets WCAG AA 4.5:1 against its direct background (see Section 1.4)
- [ ] The green primary (`oklch(0.72 0.19 155)`) must not be the sole indicator of state -- always pair with text labels or icons
- [ ] Income/expense amounts use color AND +/- prefix for colorblind users

### Touch Targets

- [ ] All interactive elements: minimum 44x44px (nav tabs, FAB, month pill, settings icon, transaction rows, month list items)
- [ ] Adjacent tap targets: minimum 8px gap (nav tabs have `px-3` = 12px padding between icon areas)
- [ ] FAB: 56x56px -- exceeds minimum

### Keyboard Navigation

- [ ] Month selector sheet: focus traps inside when open, Escape closes
- [ ] FAB: focusable, has `aria-label`
- [ ] Transaction rows: if made clickable (future), must be `<button>` or `<a>` with proper role
- [ ] Bottom nav: arrow key navigation between tabs (nice-to-have)

### Screen Reader

- [ ] Avatar: `aria-label="{user name}"` or hidden decorative with adjacent text
- [ ] Net worth amount: consider `aria-label` with fully spelled out currency for clarity
- [ ] Month selector sheet: `<SheetTitle>` provides accessible name (already handled by shadcn Sheet)
- [ ] Progress bar in budget card: `role="progressbar" aria-valuenow={percentageConsumed} aria-valuemin={0} aria-valuemax={100} aria-label="Monthly budget progress"`

### Motion

- [ ] Progress bar fill: `transition-all duration-300 ease-out` -- 300ms is within acceptable range for non-critical animation
- [ ] FAB press: `transition-transform` -- instant feedback, no delay
- [ ] Sheet open/close: already handled by shadcn Sheet (200ms ease-in-out)
- [ ] Respect `prefers-reduced-motion`: wrap transitions in `motion-safe:` prefix where appropriate

---

## Appendix A: File Change Summary

| File                                             | Action                    | Notes                                                                    |
| ------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------ |
| `src/styles/globals.css`                         | **Modify**                | Replace all `.dark` token values per Section 1. Add new semantic tokens. |
| `src/components/layout/app-shell.tsx`            | **Modify**                | Remove Header, adjust padding per Section 2.                             |
| `src/components/layout/header.tsx`               | **Delete**                | Responsibilities move to per-page headers.                               |
| `src/components/layout/bottom-nav.tsx`           | **Modify**                | 4 tabs + center FAB per Section 10.                                      |
| `src/components/month-selector.tsx`              | **Rewrite**               | Bottom sheet approach per Section 4.                                     |
| `src/features/dashboard/page.tsx`                | **Modify**                | New layout, inline header, new components per Section 5.                 |
| `src/features/dashboard/dashboard-header.tsx`    | **Create**                | Greeting + title + month pill per Section 3.                             |
| `src/features/dashboard/net-worth-card.tsx`      | **Create**                | Per Section 6.                                                           |
| `src/features/dashboard/stat-card.tsx`           | **Create**                | Shared income/spent card per Section 7.                                  |
| `src/features/dashboard/monthly-budget-card.tsx` | **Create**                | Per Section 8.                                                           |
| `src/features/dashboard/income-expense-card.tsx` | **Delete**                | Split into net-worth-card + stat-card.                                   |
| `src/features/dashboard/wallet-summary.tsx`      | **Remove from dashboard** | Keep file for wallets page, remove import from dashboard.                |
| `src/features/dashboard/recent-transactions.tsx` | **Modify**                | Restyle per Section 9.                                                   |

## Appendix B: New Dependencies

None. All icons used (`IndianRupee`, `DollarSign`, `Euro`, `PoundSterling`, `JapaneseYen`, `ArrowDownLeft`, `ArrowUpRight`, `Settings`, `Plus`, `Check`, `ChevronDown`) are available in `lucide-react` which is already installed.

## Appendix C: Token Quick Reference Card

For easy copy-paste during implementation:

```
Background tokens (dark):
  Page bg:          bg-background       → oklch(0.13 0.015 155)
  Card bg:          bg-card             → oklch(0.18 0.02 155)
  Elevated bg:      bg-surface-elevated → oklch(0.20 0.025 155)
  Muted bg:         bg-muted            → oklch(0.22 0.025 155)
  Icon circle bg:   bg-accent-soft      → oklch(0.72 0.19 155 / 12%)

Text tokens (dark):
  Primary text:     text-foreground          → oklch(0.985 0 0)
  Secondary text:   text-muted-foreground    → oklch(0.65 0.03 155)
  Accent text:      text-primary             → oklch(0.72 0.19 155)
  Income text:      text-income              → oklch(0.75 0.18 145)
  Expense text:     text-expense             → oklch(0.72 0.19 25)
  Soft icon/text:   text-accent-soft-foreground → oklch(0.72 0.19 155)

Border tokens (dark):
  Default:          border-border / ring-foreground/10
  Focus ring:       ring-ring            → oklch(0.72 0.19 155)
  Selected state:   ring-primary         → oklch(0.72 0.19 155)
```
