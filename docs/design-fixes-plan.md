# Design Fixes Implementation Plan

Ordered by dependency: foundational changes (CSS tokens, shared component variants) first, then consumers.

---

## Task 1: Define Semantic Color Tokens for Income/Expense (P0 #3)

**File:** `src/styles/globals.css`

**Rationale:** Multiple components reference `text-green-500` / `text-red-500` directly. Tailwind's `green-500` has a contrast ratio of ~2.1:1 against the dark background (`oklch(0.145 0 0)`), failing WCAG AA for normal text. We need semantic tokens tuned per color scheme, then a single find-and-replace across consumers (Task 5).

**Changes:**

1. Inside the `:root` block (after line 75, before the closing `}`), add:
   ```
   --income: oklch(0.55 0.17 142);
   --expense: oklch(0.55 0.22 25);
   ```
   These are dark-enough greens/reds for light mode on white backgrounds (contrast ratio ~4.6:1).

2. Inside the `.dark` block (after line 117, before the closing `}`), add:
   ```
   --income: oklch(0.75 0.18 145);
   --expense: oklch(0.72 0.19 25);
   ```
   These are brighter, desaturated variants tuned for the dark background. Target contrast ratio: >= 4.5:1 against `oklch(0.145 0 0)`.

3. Inside the `@theme inline` block (around line 8-49), add two new color mappings:
   ```
   --color-income: var(--income);
   --color-expense: var(--expense);
   ```
   This exposes them as Tailwind utility classes: `text-income`, `text-expense`, `bg-income`, etc.

**Verification:** After this change, `text-income` and `text-expense` should be usable as Tailwind classes. Use browser devtools contrast checker to confirm >= 4.5:1 ratio against both light and dark backgrounds. Tweak oklch lightness (first number) up or down if needed.

**Edge case:** The exact oklch values above are starting points. The implementer should visually verify contrast using a tool like the Chrome devtools contrast ratio indicator and adjust the lightness channel (first oklch parameter) if the ratio falls below 4.5:1.

---

## Task 2: Fix Chart Color System Mismatch (P0 #5)

**File:** `src/features/wallets/balance-history-chart.tsx`

**Problem:** Lines 68-69, 73-74, and 105 use `hsl(var(--primary))`, but the theme uses `oklch()` values. `hsl()` wrapping an oklch value produces an invalid color, so the chart renders with no visible stroke/fill.

**Changes:**

1. Replace **all three** occurrences of `"hsl(var(--primary))"` with `"var(--color-primary)"`:
   - Line 68: `stopColor="hsl(var(--primary))"` -> `stopColor="var(--color-primary)"`
   - Line 73: `stopColor="hsl(var(--primary))"` -> `stopColor="var(--color-primary)"`
   - Line 105: `stroke="hsl(var(--primary))"` -> `stroke="var(--color-primary)"`

**Why `var(--color-primary)` and not `var(--primary)`:** The `--color-primary` mapping in the `@theme inline` block resolves to `var(--primary)` which holds the actual oklch value. Recharts renders SVG attributes directly (not through Tailwind), so the value passed must be a complete, valid CSS color. `var(--color-primary)` resolves through the chain to the final oklch value, which modern browsers handle natively in SVG.

**Risk:** Recharts renders these as inline SVG `stop-color` and `stroke` attributes. `oklch()` is supported in all modern browsers but NOT in Safari < 15.4. Given this is a PWA targeting modern mobile browsers, this is acceptable.

---

## Task 3: Fix Category Icon Contrast (P0 #4) and DEBT Icon (P2 #14)

**File:** `src/lib/categories.ts`

**Problem:** Several category backgrounds are too light for white text overlay. Specifically: `bg-yellow-500`, `bg-lime-500`, `bg-amber-500` have poor contrast with `text-white`. Also, DEBT uses `Utensils` icon which is semantically wrong.

**Changes:**

1. Update the color values for categories with contrast issues. Change the `color` field:
   - `FREELANCE`: `"bg-lime-500"` -> `"bg-lime-700"` (darkened for white text)
   - `FOOD`: `"bg-amber-500"` -> `"bg-amber-700"` (darkened for white text)
   - `UTILITIES`: `"bg-yellow-500"` -> `"bg-yellow-700"` (darkened for white text)
   - `SALARY`: `"bg-green-500"` -> `"bg-green-700"` (borderline at 500, safe at 700)
   - `GROCERIES`: `"bg-orange-500"` -> `"bg-orange-700"` (borderline, darken for safety)

2. Fix DEBT icon (line 38): change `Utensils` to `Receipt`.
   - Update import on line 1: remove `Utensils` from the import, add `Receipt`
   - Line 38: `{ icon: Utensils, color: "bg-red-600", label: "Debt" }` -> `{ icon: Receipt, color: "bg-red-600", label: "Debt" }`

**Why -700 and not -600:** The jump from 500 to 700 ensures comfortable margin above the 4.5:1 threshold. The -600 variants of yellow and lime are still borderline.

**Alternative considered:** Use `text-black` (or `text-gray-900`) on light backgrounds instead of darkening them. Rejected because it would require per-category text color logic and the current rendering site (line 43 of `recent-transactions.tsx`) hardcodes `text-white`. The darker backgrounds preserve the simpler single-text-color approach.

**Risk:** The darker palette reduces visual vibrancy. This is an acceptable trade-off for accessibility. If the designer wants to preserve bright colors, the alternative is to add a `textColor` field to `CategoryMeta` and use dark text on light backgrounds. That requires updating every rendering site.

---

## Task 4: Fix Button Touch Targets (P0 #2)

**File:** `src/components/ui/button.tsx`

**Problem:** The `icon-sm` variant renders at `size-7` (28px), well below the 44px minimum touch target recommended by WCAG 2.5.8 and Apple HIG.

**Context:** `button.tsx` already has custom variants (per CLAUDE.md, this file is an exception to the "don't manually edit shadcn" rule).

**Changes:**

1. For the `"icon-sm"` variant (line 33-34), add a `min-w-[44px] min-h-[44px]` to the class string. The visual size remains `size-7` (28px), but the touch/click area expands to 44px. Change:
   ```
   "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
   ```
   to:
   ```
   "icon-sm": "size-7 min-w-[44px] min-h-[44px] rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
   ```

**Impact analysis:** `icon-sm` is used in:
- `month-selector.tsx` (lines 13, 19): chevron buttons -- these will get larger tap targets without changing icon appearance
- `wallet-detail-page.tsx` (lines 64, 72, 79): back, edit, delete buttons in the header row

**Risk:** Adding `min-w-[44px] min-h-[44px]` to a `size-7` element means the element grows from 28px to 44px. This will affect layout spacing in the wallet detail header (3 icon buttons in a row). Verify visually that the header row does not overflow on small screens (320px width). The gap between the 3 buttons (back, edit, delete) should still look intentional. If the 44px squares look too spacious, an alternative is to use transparent padding (`p-2`) on top of `size-7` instead of min-w/min-h, but the current approach is simpler.

**Note:** Do NOT add touch target sizing to `icon` or `icon-xs` or `icon-lg` variants in this task. Only `icon-sm` was flagged. If `icon-xs` is used in similar contexts, that should be a separate evaluation.

---

## Task 5: Replace Hardcoded Income/Expense Colors with Semantic Tokens (P0 #3, continued)

**Depends on:** Task 1 (tokens must exist before use)

**Files to change:**

1. **`src/features/dashboard/income-expense-card.tsx`** -- 6 replacements:
   - Line 44: `text-green-500` -> `text-income`
   - Line 47: `text-green-500` -> `text-income`
   - Line 55: `text-red-500` -> `text-expense`
   - Line 58: `text-red-500` -> `text-expense`
   - Line 72: `text-green-500` -> `text-income` and `text-red-500` -> `text-expense`

2. **`src/features/dashboard/recent-transactions.tsx`** -- 1 replacement:
   - Line 54: `text-green-500` -> `text-income` and `text-red-500` -> `text-expense`

**Verification:** Run `pnpm build` to confirm Tailwind recognizes the new utility classes. If `text-income` is not generated, the `@theme inline` mapping from Task 1 is missing or incorrect.

---

## Task 6: Fix Bottom Nav Touch Targets (P0 #1)

**File:** `src/components/layout/bottom-nav.tsx`

**Problem:** NavLink has `py-2` which gives approximately 36px vertical touch target (20px icon + 12px text + 8px top padding + 8px bottom padding). Below the 44px minimum.

**Changes:**

1. Line 29: Change `py-2` to `py-3` within the NavLink className string:
   ```
   "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors"
   ```
   becomes:
   ```
   "flex flex-col items-center gap-1 px-3 py-3 text-xs transition-colors"
   ```

2. Optionally add `min-h-[44px]` as a safety net to guarantee the minimum regardless of content height:
   ```
   "flex flex-col items-center gap-1 px-3 py-3 min-h-[44px] text-xs transition-colors"
   ```

**Risk:** The parent `div` has `h-16` (64px). With `py-3` (12px top + 12px bottom) plus content (~32px icon+text), total is ~56px, which fits within 64px with room to spare. No overflow risk.

---

## Task 7: Fix Wallet Summary Row Touch Targets (P1 #6)

**File:** `src/features/dashboard/wallet-summary.tsx`

**Problem:** Button rows have `py-1.5` (12px total vertical padding), making rows approximately 36-38px tall. Below the 44px minimum for interactive elements.

**Changes:**

1. Line 36: Change `py-1.5` to `py-2.5` in the button className:
   ```
   "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
   ```
   becomes:
   ```
   "flex w-full items-center justify-between rounded-md px-2 py-2.5 text-left transition-colors hover:bg-accent"
   ```

2. Add `min-h-[44px]` for guaranteed minimum:
   ```
   "flex w-full items-center justify-between rounded-md px-2 py-2.5 min-h-[44px] text-left transition-colors hover:bg-accent"
   ```

---

## Task 8: Replace Raw `<button>` with `<Button variant="link">` in Error States (P1 #7)

**Files:**
- `src/features/dashboard/page.tsx`
- `src/features/wallets/page.tsx`
- `src/features/wallets/wallet-detail-page.tsx`

**Problem:** Error states use raw `<button>` elements with manually styled classes (`text-sm text-primary underline`). This bypasses the design system, misses focus styles, and produces inconsistent interactive elements.

**Changes for each file:**

1. **`src/features/dashboard/page.tsx`** (lines 33-38):
   - Ensure `Button` is imported (it's not currently imported in this file -- add: `import { Button } from "@/components/ui/button";`)
   - Replace:
     ```tsx
     <button
       onClick={() => dashboard.refetch()}
       className="text-sm text-primary underline"
     >
       Try again
     </button>
     ```
     with:
     ```tsx
     <Button variant="link" onClick={() => dashboard.refetch()}>
       Try again
     </Button>
     ```

2. **`src/features/wallets/page.tsx`** (lines 27-29):
   - `Button` is already imported.
   - Same replacement pattern: raw `<button>` -> `<Button variant="link">`.

3. **`src/features/wallets/wallet-detail-page.tsx`** (lines 43-48):
   - `Button` is already imported.
   - Same replacement pattern. Note this one navigates (`navigate("/wallets")`) rather than refetching. Consider using `<Button variant="link" asChild><Link to="/wallets">Back to wallets</Link></Button>` -- but check if the `Button` component supports `asChild`. If not, keeping the `onClick` approach is fine.

---

## Task 9: Fix App Shell Main Content Padding (P1 #8)

**File:** `src/components/layout/app-shell.tsx`

**Problem:** `pt-2` (8px) between header and content feels cramped.

**Changes:**

1. Line 9: Change `pt-2` to `pt-4`:
   ```
   <main className="flex-1 overflow-y-auto pb-20 pt-2">
   ```
   becomes:
   ```
   <main className="flex-1 overflow-y-auto pb-20 pt-4">
   ```

**Impact:** This affects every page rendered through the AppShell. The dashboard loading skeleton (line 16 of `page.tsx`) also has `pt-2` which will now stack with the shell's `pt-4` for 24px total top padding in loading state. Evaluate whether the skeleton's `pt-2` should be removed (see Task 10).

---

## Task 10: Consolidate Dashboard Padding (P1 #9)

**Files:**
- `src/features/dashboard/page.tsx`
- `src/features/dashboard/income-expense-card.tsx`
- `src/features/dashboard/wallet-summary.tsx`
- `src/features/dashboard/recent-transactions.tsx`

**Problem:** Each child component applies its own `px-4`, creating duplicated padding logic. If padding needs to change, you must update 4+ files.

**Changes:**

1. **`src/features/dashboard/page.tsx`**: Wrap the returned content in `px-4`:
   - Loading state (line 16): keep `px-4` here since it's returned early (already has `px-4`)
   - Main return (line 46): change `<div className="space-y-4 pb-4">` to `<div className="space-y-4 px-4 pb-4">`

2. **`src/features/dashboard/income-expense-card.tsx`**: Remove the `px-4` from the root div:
   - Line 23: `<div className="space-y-3 px-4">` -> `<div className="space-y-3">`

3. **`src/features/dashboard/wallet-summary.tsx`**: Remove the `px-4` wrapper:
   - Line 24: `<div className="px-4">` -> remove wrapper div entirely, return `<Card>` directly. OR change to `<div>` without `px-4`.

4. **`src/features/dashboard/recent-transactions.tsx`**: Remove `px-4` wrappers:
   - Line 14: `<div className="px-4">` -> `<div>` (empty state wrapper)
   - Line 25: `<div className="px-4">` -> `<div>` (content wrapper)

**Risk:** The `balance-history-chart.tsx` is not used on the dashboard page (it's in wallets), so it's not part of this consolidation. However, if any future dashboard component is added, the implementer must remember that `px-4` now comes from the page root, not individual components.

**Important consideration:** `wallet-summary.tsx` and `recent-transactions.tsx` are only used within the dashboard page, so removing their `px-4` is safe. If they were shared components, you'd need to verify all usage sites. Confirm by grepping for imports of these components.

---

## Task 11: Fix Skeleton Height Mismatches (P1 #10, #11)

**Files:**
- `src/features/dashboard/page.tsx`
- `src/features/wallets/page.tsx`
- `src/features/wallets/balance-history-chart.tsx`

**Problem:** Skeleton placeholders don't match the dimensions of the real rendered content, causing layout shift on load.

**Changes:**

1. **`src/features/dashboard/page.tsx`** loading state (lines 16-26):
   Measure actual rendered heights and update skeletons:
   - Net worth card: currently `h-24`, verify against actual `IncomeExpenseCard` net-worth card height (CardContent with `py-4`, ~80px text -> likely ~96px, so `h-24` is close, probably fine)
   - Income/Expense cards: currently `h-20` each, verify against actual (~68-72px with py-3 + text)
   - Wallet summary card: currently `h-12`, but actual card has header + rows, likely ~120-160px depending on wallet count. Change to `h-32` or similar estimate.
   - Recent transactions: currently `h-64`, likely reasonable for 5 transactions.

   **Recommended approach:** Rather than guessing heights, render the app, inspect actual element heights in devtools, and set skeleton heights to match. Document the measured values in a code comment.

2. **`src/features/wallets/page.tsx`** loading state (line 17):
   - Currently `h-16` (64px), but `WalletCard` renders with `py-3` + icon/text content = approximately 72-80px.
   - Change `h-16` to `h-20` (80px).

3. **`src/features/wallets/balance-history-chart.tsx`** loading state (lines 30-32):
   - The skeleton is unwrapped (just `<Skeleton>` inside a `px-4` div), but the real content is wrapped in `<Card>`. Wrap the skeleton in a Card for visual consistency:
     ```tsx
     <div className="px-4">
       <Card>
         <CardContent className="py-4">
           <Skeleton className="h-44 w-full rounded-xl" />
         </CardContent>
       </Card>
     </div>
     ```
   - Adjust height: real chart is `h-[180px]` (ResponsiveContainer) + header padding = ~220px total. Skeleton should be `h-52` (208px) or similar.

---

## Task 12: Fix Wallet Form Label Associations (P1 #12)

**File:** `src/features/wallets/wallet-form.tsx`

**Problem:** `<label>` elements lack `htmlFor` attributes and corresponding `<Input>`/`<Select>` elements lack `id` attributes. This breaks screen reader association and click-to-focus behavior.

**Changes:**

Add `id` props to inputs and `htmlFor` to labels:

1. Name field (lines 89-95):
   - `<label className="text-sm font-medium">` -> `<label htmlFor="wallet-name" className="text-sm font-medium">`
   - `<Input value={name} ...` -> `<Input id="wallet-name" value={name} ...`

2. Type select (lines 100-116):
   - `<label className="text-sm font-medium">` -> `<label htmlFor="wallet-type" className="text-sm font-medium">`
   - `<SelectTrigger>` -> `<SelectTrigger id="wallet-type">`

3. Currency select (lines 121-136):
   - `<label className="text-sm font-medium">` -> `<label htmlFor="wallet-currency" className="text-sm font-medium">`
   - `<SelectTrigger>` -> `<SelectTrigger id="wallet-currency">`

4. Balance input (lines 139-145):
   - `<label className="text-sm font-medium">` -> `<label htmlFor="wallet-balance" className="text-sm font-medium">`
   - `<Input type="number" ...` -> `<Input id="wallet-balance" type="number" ...`

5. Account Number field (lines 150-155):
   - `<label className="text-sm font-medium">` -> `<label htmlFor="wallet-account" className="text-sm font-medium">`
   - `<Input value={accountNumber} ...` -> `<Input id="wallet-account" value={accountNumber} ...`

**Risk:** The form is used for both create and edit (same component instance). Since IDs must be unique in the document, and only one Sheet is open at a time, there's no collision risk.

---

## Task 13: Reset Wallet Form State on Re-open (P1 #13)

**File:** `src/features/wallets/wallet-form.tsx`

**Problem:** `useState` initial values are set from `wallet` prop at mount time. When the Sheet is closed and reopened (or when switching from edit to create), stale values persist because React preserves state for the same component instance.

**Changes:**

Add a `useEffect` that resets state when `open` transitions to `true` or when the `wallet` prop changes:

1. Add `useEffect` import (already have `useState` from React).

2. After the `isPending` declaration (line 56), add an effect:
   ```tsx
   useEffect(() => {
     if (open) {
       setName(wallet?.name ?? "");
       setWalletType(wallet?.walletType ?? "checking");
       setCurrency(wallet?.currency ?? "INR");
       setBalance(wallet ? formatAmount(wallet.balance) : "0.00");
       setAccountNumber(wallet?.accountNumber ?? "");
     }
   }, [open, wallet]);
   ```

**Alternative considered:** Use `key={wallet?.id ?? "new"}` on the `<Sheet>` to force remount. This is simpler but causes a full unmount/remount of the Sheet component including its animations, which may produce a visual flicker. The `useEffect` approach is more surgical.

**Risk:** The `useEffect` will fire on every `wallet` reference change. Since `wallet` comes from TanStack Query, it may be a new object reference on every render. To prevent unnecessary resets, depend on `wallet?.id` instead of `wallet`:
```tsx
const walletId = wallet?.id;
useEffect(() => {
  if (open) {
    setName(wallet?.name ?? "");
    setWalletType(wallet?.walletType ?? "checking");
    setCurrency(wallet?.currency ?? "INR");
    setBalance(wallet ? formatAmount(wallet.balance) : "0.00");
    setAccountNumber(wallet?.accountNumber ?? "");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open, walletId]);
```

The eslint-disable is needed because we intentionally read `wallet` inside the effect but only trigger on `walletId`.

---

## Task 14: Add Tap Feedback to Wallet Cards (P2 #15)

**File:** `src/features/wallets/wallet-card.tsx`

**Changes:**

1. Line 36: Add `active:scale-[0.98]` and `transition-transform` to the Card className:
   ```
   className="cursor-pointer transition-colors hover:bg-accent/50"
   ```
   becomes:
   ```
   className="cursor-pointer transition-all duration-150 hover:bg-accent/50 active:scale-[0.98]"
   ```

**Note:** Changed `transition-colors` to `transition-all` (or `transition-[colors,transform]` for specificity) so the scale transform is also animated.

---

## Task 15: Add Loading Spinner to Wallet Form Submit (P2 #16)

**File:** `src/features/wallets/wallet-form.tsx`

**Changes:**

1. Add `Loader2` to lucide-react imports (add an import line):
   ```tsx
   import { Loader2 } from "lucide-react";
   ```

2. Line 158: Update the submit button to show a spinner when pending:
   ```tsx
   <Button type="submit" className="w-full" disabled={isPending}>
     {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
     {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Wallet"}
   </Button>
   ```

---

## Task 16: Wallet Detail Back Button as Link (P2 #18)

**File:** `src/features/wallets/wallet-detail-page.tsx`

**Problem:** The back button uses `onClick={() => navigate("/wallets")}` instead of a proper link, which prevents standard link behaviors (middle-click, right-click menu, etc.).

**Changes:**

1. Add `Link` to imports from `react-router`:
   ```tsx
   import { useParams, useNavigate, Link } from "react-router";
   ```

2. Replace the back button (lines 63-68):
   ```tsx
   <Button
     variant="ghost"
     size="icon-sm"
     onClick={() => navigate("/wallets")}
   >
   ```
   with:
   ```tsx
   <Button variant="ghost" size="icon-sm" asChild>
     <Link to="/wallets">
   ```
   **Caveat:** Verify that the shadcn `Button` component supports `asChild` (it uses `@base-ui/react/button`, not Radix). If `asChild` is not supported, wrap differently:
   ```tsx
   <Link to="/wallets" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}>
     <ArrowLeft className="h-4 w-4" />
   </Link>
   ```
   This requires importing `buttonVariants` from `@/components/ui/button`.

---

## Task 17: Prevent Double-Submit on Delete Dialog (P2 #19)

**File:** `src/features/wallets/wallet-detail-page.tsx`

**Problem:** The delete dialog's "Delete" button is disabled while pending, but the Cancel button and dialog backdrop are still interactive. A user could trigger a second delete or close the dialog during deletion.

**Changes:**

1. Line 126: Disable the Cancel button during deletion:
   ```tsx
   <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteWallet.isPending}>
   ```

2. Prevent closing the dialog via backdrop/escape during deletion by conditionally controlling `onOpenChange`:
   ```tsx
   <Dialog
     open={deleteOpen}
     onOpenChange={(open) => {
       if (!deleteWallet.isPending) setDeleteOpen(open);
     }}
   >
   ```

---

## Implementation Order Summary

| Order | Task | Priority | Dependency |
|-------|------|----------|------------|
| 1     | Task 1: Semantic color tokens | P0 | None |
| 2     | Task 2: Chart color fix | P0 | None |
| 3     | Task 3: Category contrast + DEBT icon | P0 | None |
| 4     | Task 4: Button touch targets | P0 | None |
| 5     | Task 5: Replace green/red colors | P0 | Task 1 |
| 6     | Task 6: Bottom nav touch targets | P0 | None |
| 7     | Task 7: Wallet summary touch targets | P1 | None |
| 8     | Task 8: Error state buttons | P1 | None |
| 9     | Task 9: App shell padding | P1 | None |
| 10    | Task 10: Dashboard padding consolidation | P1 | Task 9 (to avoid double-padding) |
| 11    | Task 11: Skeleton heights | P1 | Task 10 (padding changes affect heights) |
| 12    | Task 12: Form label associations | P1 | None |
| 13    | Task 13: Form state reset | P1 | None |
| 14    | Task 14: Wallet card tap feedback | P2 | None |
| 15    | Task 15: Form submit spinner | P2 | None |
| 16    | Task 16: Back button as Link | P2 | None |
| 17    | Task 17: Delete double-submit guard | P2 | None |

Tasks 1-4 and 6 can be done in parallel (no interdependencies). Task 5 must follow Task 1. Tasks 9 -> 10 -> 11 are sequential. All other tasks are independent.

## Verification Checklist

After all changes:

- [ ] `pnpm build` passes with no type errors
- [ ] `pnpm lint` passes
- [ ] Verify `text-income` and `text-expense` render correctly in both light and dark mode
- [ ] Check contrast ratios: income/expense text >= 4.5:1 on both backgrounds
- [ ] Check contrast ratios: all category icon backgrounds with white text >= 4.5:1
- [ ] Verify chart renders visible stroke and fill gradient in dark mode
- [ ] Tap all bottom nav items on a real mobile device -- touch targets feel comfortable
- [ ] Tap month selector chevrons on mobile -- no difficulty hitting them
- [ ] Tap wallet summary rows on dashboard -- no difficulty
- [ ] Open wallet form, fill partially, close, reopen -- form is reset
- [ ] Test screen reader on wallet form -- labels are announced for each field
- [ ] Verify skeleton -> real content transition has no significant layout shift
- [ ] Delete wallet: click delete, spam the delete button -- only one request fires
