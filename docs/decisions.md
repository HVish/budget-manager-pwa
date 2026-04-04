# Decision Records

Key decisions where someone could reasonably make the wrong choice without context. Delete entries when the "why" is obvious from the code or there's no realistic alternative anymore.

---

## Wallets Screen (2026-04-04)

### Net worth: use dashboard API, not client-side sum

- **Why:** Client-side summing breaks for multi-currency users — can't add INR + USD without conversion rates. The dashboard API already returns server-side converted `netWorth`.
- **Rejected:** Summing `Wallet.balance` across all wallets.

### Sparklines: batched parallel fetch with `useQueries`

- **Why:** `useQueries` fires all wallet history requests in parallel, shares cache keys with the detail page (zero duplicate fetches on navigation), and uses 5-minute `staleTime` since balance history is append-only.
- **Rejected:** Individual hooks per card (N waterfall observers), IntersectionObserver (premature for <10 wallets).

### Net worth change badge: built but hidden

- **Why:** API has no month-over-month comparison. `ChangeBadge` exists in `net-worth-summary.tsx` but isn't rendered. Don't fetch two months of dashboard data for a decorative percentage.
- **When to enable:** API adds `previousNetWorth` to dashboard response — one-line prop change.

### Filter tabs: local state, not Zustand

- **Why:** Filter selection is transient — should reset on navigation. Persisting to store surprises users returning with a forgotten filter active.

### Wallet form: full-screen pages, not bottom sheet

- **Why:** Bottom sheets fight the virtual keyboard on mobile — inputs get obscured, scroll becomes unpredictable. Full-screen pages at `/wallets/new` and `/wallets/:id/edit` give proper scroll, safe-area handling, and view transition support.
- **Rejected:** Sheet-based `WalletForm` component (original implementation, deleted).

### View transitions: data attribute + CSS, not JS animation

- **Why:** CSS `::view-transition` pseudo-elements are hardware-accelerated and don't block the main thread. Transition type is set via `data-vt-type` on `<html>`, matched by CSS selectors. `useAppNavigate` auto-detects the type (tab-switch, push/pop, modal) from route patterns.
- **Rejected:** Framer Motion page transitions (heavy bundle), manual `startViewTransition` (React Router already calls it with `viewTransition: true`).

---

## shadcn Components (2026-04-04)

### Scaffold via CLI, then customize freely

- **Why:** shadcn's design is "you own the code." Direct edits for bug fixes, styling, and accessibility are expected. Don't re-run `shadcn add` on customized components — it overwrites.
