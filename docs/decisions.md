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

### Filter tabs scroll affordance: gradient edge mask, not arrows/dots

- **Why:** On narrow viewports the tab row overflows. Users miss that it scrolls. A `mask-image` fade on the overflowing edge(s) signals continuation without adding DOM elements or competing touch targets.
- **How:** Scroll position drives a `maskStyle` object (`none`/`start`/`end`/`both`). Asymmetric padding (`pl-4 pr-2`) ensures the last tab clips naturally.
- **Rejected:** Arrow indicators (desktop pattern, adds clutter), scroll dots (wrong semantic for a filter bar), auto-scroll bounce (distracting, complex state management).

### Wallet form: full-screen pages, not bottom sheet

- **Why:** Bottom sheets fight the virtual keyboard on mobile — inputs get obscured, scroll becomes unpredictable. Full-screen pages at `/wallets/new` and `/wallets/:id/edit` give proper scroll, safe-area handling, and view transition support.
- **Rejected:** Sheet-based `WalletForm` component (original implementation, deleted).

### View transitions: manual `startViewTransition` + per-route Suspense skeletons

- **Why:** We call `document.startViewTransition()` ourselves with `flushSync` for synchronous DOM capture. Each lazy route is wrapped in its own `Suspense` via `lazyPage()` with an eagerly-imported skeleton fallback. A fresh Suspense boundary (never showed content before) always displays its fallback, so `flushSync` renders the skeleton synchronously — the view transition captures it instantly, even on first visit before the chunk has loaded.
- **Skeletons:** Three variants in `page-skeleton.tsx` — `FormPageSkeleton` (edit/create pages), `DetailPageSkeleton` (transaction detail), `ListPageSkeleton` (settings, categories). Eagerly bundled (~1.7 KB total), actual page logic stays lazy.
- **Browser back/forward:** `usePopstateViewTransitions` uses the Navigation API (`window.navigation` 'navigate' event) on Chrome. `event.intercept()` takes over the traverse, then dispatches a synthetic popstate inside `startViewTransition + flushSync` so React Router processes it synchronously. Falls back to a capture-phase popstate listener with timeout on Safari/Firefox.
- **All links:** `AppLink` component wraps `NavLink` and routes clicks through `useAppNavigate` instead of React Router's default navigation.
- **Transition type:** Auto-detected from route patterns via `getTransitionType()`, set as `data-vt-type` on `<html>`, matched by CSS `::view-transition-*` selectors.
- **Rejected:** React Router's `viewTransition: true` (remembers forward transitions and auto-applies its own `startViewTransition` on POP, conflicting with our popstate handler and breaking scroll restoration), preloading chunks before transition (freezes UI while downloading on first visit), Framer Motion (heavy bundle).

### Service worker: network-first HTML, cache-first hashed assets

- **Why:** Stale-while-revalidate for everything served old `index.html` after deploys, which referenced deleted content-hashed assets — broken app until next reload.
- **Strategy:** Navigation requests (HTML) → network-first with cache fallback (always fresh after deploy). `/assets/*` (Vite-hashed JS/CSS) → cache-first (immutable, instant). Everything else → network-first.
- **Rejected:** Stale-while-revalidate for all (deploy breakage), removing SW entirely (lose offline + PWA install).

---

## Transactions Screen (2026-04-05)

### Search: debounce at 300ms, skip date bounds

- **Why:** API `title` parameter requires min 2 chars. `useDebouncedValue(query, 300)` avoids API spam. When search is active (`>= 2 chars`), date bounds are omitted so results span all time — users searching "Grocery" expect to find it regardless of the selected month.
- **Rejected:** Client-side filtering of loaded pages (cursor pagination means incomplete results).

### Advanced filters: draft-state pattern in filter sheet

- **Why:** The filter sheet uses a conditional-render pattern (`{open && <FilterSheetBody />}`) so the inner component mounts fresh with `useState(initialFilters)` each time. No `useEffect` sync needed — the draft is always initialized from committed state. Changes are only applied on "Apply" button press.
- **Rejected:** Keeping draft state in the parent (applies partial changes on every toggle), `useEffect` to sync props to state (complex, easy to get wrong).

### Income/Expenses filter: use minAmount/maxAmount

- **Why:** The API has no `type=income|expense` filter. Since amounts are signed (positive = credit, negative = debit), `minAmount=1` selects income and `maxAmount=-1` selects expenses.

### Daily net: omit for mixed-currency date groups

- **Why:** Same reasoning as "net worth: use dashboard API" — can't sum INR + USD without conversion rates. When a date group has transactions in multiple currencies, the daily net is hidden.

### Tab routes: eager import, not React.lazy

- **Why:** Tab routes (Dashboard, Wallets, Transactions) are eagerly imported so tab-switch view transitions are instant with no loading spinner flash. `React.lazy` is reserved for push-navigated routes (forms, detail pages).

---

## New Transaction Screen (2026-04-05)

### Transfer amounts: both positive, API handles debit/credit

- **Why:** The `POST /api/v1/transfers` endpoint requires `fromAmount` and `toAmount` both positive (`minimum: 1`). The API creates the signed debit/credit legs internally. Don't negate `fromAmount` client-side.
- **Rejected:** Sending `fromAmount` as negative (causes API 422).

### Multi-currency transfers: same amount for both legs (v1)

- **Why:** The API supports different `fromAmount`/`toAmount` for cross-currency transfers, but exposing an exchange rate input adds significant UX complexity. For v1, `toAmount = fromAmount`.
- **When to change:** User feedback requests cross-currency transfers — add a second amount input or exchange rate field.

### Tags input: deferred

- **Why:** API supports `tags[]` but a good tag input UX (autocomplete, chip display, free-form entry) is complex. Not worth the effort until users ask for it.
- **When to add:** User feedback or when a tags management screen is built.

### Shared form primitives: `FieldLabel` + `inputClassName`

- **Why:** Both wallet and transaction forms need the same uppercase label and `h-14 rounded-xl` input styling. Extracted to `src/components/ui/field-label.tsx` and `src/lib/form-constants.ts`. Wallet files re-export for backward compatibility.

---

## Desktop Responsive Architecture (2026-04-18)

### LayoutContext over CSS-only responsive

- **Why:** Tab pages render inside `AppShell` (mobile) or `DesktopShell` (desktop) -- the shell already knows the variant. Passing it via context avoids redundant `matchMedia` calls in every child and lets components like `PageHeaderBar` and `ActionButton` make structural decisions (show/hide back buttons, icon-only vs labeled) rather than just CSS overrides.
- **Rejected:** Pure CSS `lg:` breakpoints for everything (can't conditionally render DOM nodes), a global Zustand `layout` store (context already scoped to the shell subtree).

### ResponsiveSheet uses SheetClose / SheetTitle inside Dialog mode

- **Why:** Both `Sheet` and `Dialog` in this project are built on `@base-ui/react/dialog`, which means they share the same React context. `SheetClose` works inside a `Dialog.Root` because the underlying `Dialog.Close` primitive is identical. This is intentional -- it avoids creating wrapper re-exports -- but it's a coupling to the base-ui internals.
- **Risk:** If the project ever swaps Sheet or Dialog for a different primitive library, this assumption breaks. Grep for `SheetClose` + `SheetTitle` inside `ResponsiveSheet` consumers.

### Pre-built layout value objects avoid re-renders

- **Why:** `COMPACT_LAYOUT`, `EXPANDED_LAYOUT`, etc. are module-level constants. Passing a new `{ variant, safeAreaHandled }` object literal as the context value would cause all `useLayout()` consumers to re-render on every shell render, even when the variant hasn't changed.

### Shell routing: FullScreenLayout wraps all non-tab routes

- **Why:** On mobile, detail/form pages render full-screen (no bottom nav). On desktop, they need the sidebar+top bar. `FullScreenLayout` in `routes.tsx` conditionally wraps `<Outlet>` with `DesktopShell` (desktop) or a bare `min-h-dvh` flex container (mobile). This keeps the route definitions unchanged — the shell selection is automatic.
- **Rejected:** Moving all routes into `AppShell` (would show bottom nav on mobile form pages), per-page shell selection (pages shouldn't know about platform).

### Desktop view transitions scoped to main-content

- **Why:** `DesktopShell` sets `view-transition-name: main-content` on the content wrapper. CSS `@media (min-width: 1024px)` suppresses `::view-transition-*(root)` and targets `::view-transition-*(main-content)` with a fade. Sidebar and top bar stay completely static during navigation.
- **Rejected:** Animating the full page (sidebar/top bar flicker), disabling transitions entirely on desktop (jarring).

### Content max-width: 650px

- **Why:** Single-column layout at 650px keeps content readable and consistent with the mobile experience. Wider layouts (multi-column dashboards) were evaluated but added complexity without proportional benefit for a personal budget app. The 230px sidebar + 80px padding + 650px content = 960px minimum, which fits comfortably on 1024px+ screens.
- **Rejected:** 1100px (too wide, content stretches), multi-column dashboard (added complexity for marginal benefit), no max-width (content unreadable on ultra-wide monitors).

### isDesktopViewport() for event handlers

- **Why:** `navigation.ts` popstate handlers can't call React hooks. `isDesktopViewport()` reads the cached `matchMedia` result synchronously. This replaces the previous `setDesktopMode()` module-level mutable which was a render-phase side effect.
- **Rejected:** Module-level mutable with `setDesktopMode()` (render-phase side effect, stale reads), Zustand store for a single boolean (overkill).

---

## shadcn Components (2026-04-04)

### Scaffold via CLI, then customize freely

- **Why:** shadcn's design is "you own the code." Direct edits for bug fixes, styling, and accessibility are expected. Don't re-run `shadcn add` on customized components — it overwrites.
