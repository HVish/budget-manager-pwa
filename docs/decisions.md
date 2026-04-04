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

### View transitions: manual `startViewTransition`, not React Router's `viewTransition` option

- **Why:** React Router's `viewTransition: true` doesn't support custom transition types (push vs pop vs modal) and doesn't animate browser back/forward. We call `document.startViewTransition()` ourselves with `flushSync` for synchronous DOM capture.
- **Programmatic nav:** `useAppNavigate` wraps `routerNavigate(path)` in `startViewTransition(() => flushSync(...))`. For `navigate(-1)`, delegates to the Navigation API handler since `history.go(-1)` fires popstate asynchronously.
- **Browser back/forward:** `usePopstateViewTransitions` uses the Navigation API (`window.navigation` 'navigate' event) on Chrome. `event.intercept()` takes over the traverse, then dispatches a synthetic popstate inside `startViewTransition + flushSync` so React Router processes it synchronously. Falls back to a capture-phase popstate listener with timeout on Safari/Firefox.
- **All links:** `AppLink` component wraps `NavLink` and routes clicks through `useAppNavigate` instead of React Router's default navigation.
- **Transition type:** Auto-detected from route patterns via `getTransitionType()`, set as `data-vt-type` on `<html>`, matched by CSS `::view-transition-*` selectors.
- **Rejected:** React Router's `viewTransition: true` (no custom types, no back/forward support), Framer Motion (heavy bundle).

### Service worker: network-first HTML, cache-first hashed assets

- **Why:** Stale-while-revalidate for everything served old `index.html` after deploys, which referenced deleted content-hashed assets — broken app until next reload.
- **Strategy:** Navigation requests (HTML) → network-first with cache fallback (always fresh after deploy). `/assets/*` (Vite-hashed JS/CSS) → cache-first (immutable, instant). Everything else → network-first.
- **Rejected:** Stale-while-revalidate for all (deploy breakage), removing SW entirely (lose offline + PWA install).

---

## shadcn Components (2026-04-04)

### Scaffold via CLI, then customize freely

- **Why:** shadcn's design is "you own the code." Direct edits for bug fixes, styling, and accessibility are expected. Don't re-run `shadcn add` on customized components — it overwrites.
