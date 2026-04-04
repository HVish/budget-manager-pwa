# Budget Manager PWA — Implementation Plan

## Context

The Android app frontend for the Budget Manager API has been abandoned due to release hurdles. We're building a React PWA instead, hosted at `budgetmanager.vishnusingh.in`, providing a native-like mobile experience. This will be a **separate repo** using Auth0 for OIDC auth, with app-shell caching for PWA offline support.

This session will set up the core infrastructure + Dashboard and Wallets pages.

---

## Tech Stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | **React 19 + TypeScript + Vite** | Fast builds, great DX, modern React features |
| Styling | **Tailwind CSS v4 + shadcn/ui** | Reusable components, utility-first, user requested |
| State (global) | **Zustand** | Minimal boilerplate, perfect for month selector & user prefs |
| Server state | **TanStack Query v5** | Caching, refetching, pagination, loading/error states |
| Routing | **React Router v7** | Mature, nested layouts, loader patterns |
| Auth | **@auth0/auth0-react** | Direct Auth0 integration, handles tokens & redirects |
| HTTP | **ky** | Tiny fetch wrapper, interceptors for auth headers |
| PWA | **vite-plugin-pwa** | Workbox-based service worker, manifest generation |
| Dates | **date-fns** | Tree-shakable, lightweight date manipulation |
| Currency | **Intl.NumberFormat** | Native browser API, no extra dependency |
| Icons | **lucide-react** | Works with shadcn, consistent icon set |

---

## Project Structure

```
budget-manager-pwa/
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512)
│   └── favicon.ico
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Root: Auth0Provider → Router → QueryClient
│   ├── routes.tsx          # Route definitions
│   │
│   ├── api/                # API layer
│   │   ├── client.ts       # ky instance with auth interceptor
│   │   ├── types.ts        # API request/response types (from OpenAPI)
│   │   └── hooks/          # TanStack Query hooks per resource
│   │       ├── use-wallets.ts
│   │       ├── use-transactions.ts
│   │       ├── use-dashboard.ts
│   │       ├── use-budgets.ts
│   │       └── use-profile.ts
│   │
│   ├── components/         # Shared UI components
│   │   ├── ui/             # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── layout/
│   │   │   ├── app-shell.tsx       # Main layout: header + bottom nav + content
│   │   │   ├── header.tsx          # Top bar with month selector
│   │   │   └── bottom-nav.tsx      # Mobile bottom navigation
│   │   ├── month-selector.tsx      # Global month/year picker
│   │   ├── currency-display.tsx    # Formats int64 cents → ₹1,234.56
│   │   ├── category-badge.tsx      # Colored category chip
│   │   ├── empty-state.tsx         # Reusable empty state illustration
│   │   └── loading-skeleton.tsx    # Skeleton loaders
│   │
│   ├── features/           # Feature pages
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Dashboard page
│   │   │   ├── income-expense-card.tsx
│   │   │   ├── wallet-summary.tsx
│   │   │   └── recent-transactions.tsx
│   │   ├── wallets/
│   │   │   ├── page.tsx            # Wallet list page
│   │   │   ├── wallet-card.tsx
│   │   │   ├── wallet-detail-page.tsx
│   │   │   ├── wallet-form.tsx     # Create/edit wallet sheet
│   │   │   └── balance-history-chart.tsx
│   │   └── auth/
│   │       ├── login-page.tsx
│   │       └── callback-page.tsx
│   │
│   ├── stores/             # Zustand stores
│   │   ├── month-store.ts  # Global month/year selection
│   │   └── user-store.ts   # User profile & preferences
│   │
│   ├── lib/                # Utilities
│   │   ├── utils.ts        # cn() helper, misc utils
│   │   ├── currency.ts     # Format minor units to display string
│   │   ├── categories.ts   # Category metadata (colors, icons)
│   │   └── date.ts         # Month range helpers
│   │
│   └── styles/
│       └── globals.css     # Tailwind imports + CSS variables
│
├── index.html
├── vite.config.ts          # Vite + PWA plugin config
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example            # AUTH0_DOMAIN, AUTH0_CLIENT_ID, API_URL
```

---

## Key Design Decisions

### 1. Global Month Selector (Zustand store)

```ts
// stores/month-store.ts
interface MonthStore {
  year: number;
  month: number;        // 1-12
  setMonth: (year: number, month: number) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  // Derived
  startDate: string;    // "2026-04-01"
  endDate: string;      // "2026-04-30"
  isCurrent: boolean;   // Can't go beyond current month
}
```

- Persisted to `localStorage` so it survives refreshes
- All TanStack Query hooks accept `{ year, month }` and re-fetch when they change
- Month selector lives in the header, visible on every page
- Navigate with left/right arrows, tap to open month/year picker
- Future months disabled (API rejects future dates)

### 2. API Client with Auth

```ts
// api/client.ts
const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getAccessTokenSilently();
        request.headers.set('Authorization', `Bearer ${token}`);
      }
    ]
  }
});
```

### 3. TanStack Query Keys Convention

```ts
// All queries keyed by [resource, filters] so month changes auto-invalidate
queryKey: ['dashboard', { year, month }]
queryKey: ['wallets']
queryKey: ['wallets', walletId, 'history', { startDate, endDate }]
queryKey: ['transactions', { year, month, walletIds }]
```

### 4. Mobile-First Layout

- **Bottom navigation**: Dashboard, Wallets, Transactions, Budgets, Profile (5 tabs)
- **Header**: App title left, month selector center/right
- **Pull-to-refresh**: On list pages via TanStack Query refetch
- **Sheet dialogs**: Create/edit forms slide up from bottom (shadcn Sheet)
- **Safe area insets**: CSS `env(safe-area-inset-*)` for notched phones
- **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`

### 5. PWA Configuration

```ts
// vite.config.ts → VitePWA plugin
{
  registerType: 'autoUpdate',
  manifest: {
    name: 'Budget Manager',
    short_name: 'Budget',
    start_url: '/',
    display: 'standalone',
    theme_color: '#09090b',    // zinc-950
    background_color: '#09090b',
    icons: [...]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    // App shell caching only — no API runtime caching
  }
}
```

### 6. Currency Display

```ts
// lib/currency.ts
function formatCurrency(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}
// -5000, "INR" → "-₹50.00"
```

---

## Implementation Steps (This Session)

### Step 1: Project Bootstrap
- `npm create vite@latest budget-manager-pwa -- --template react-ts`
- Install dependencies: tailwind v4, shadcn/ui, zustand, @tanstack/react-query, react-router, @auth0/auth0-react, ky, date-fns, lucide-react, vite-plugin-pwa
- Configure Vite, Tailwind, TypeScript
- Initialize shadcn/ui (`npx shadcn@latest init`)
- Add shadcn components: button, card, sheet, dialog, select, input, skeleton, badge, dropdown-menu, separator, avatar, tabs

### Step 2: PWA Setup
- Configure vite-plugin-pwa with manifest + workbox
- Add PWA icons (placeholder)
- Set up `index.html` with meta tags (theme-color, viewport-fit, apple-mobile-web-app)

### Step 3: Auth + API Client
- Auth0Provider wrapper in App.tsx
- Protected route wrapper component
- ky API client with auth token interceptor
- `.env.example` with required variables

### Step 4: Core Stores & Utilities
- Month store (Zustand + localStorage persistence)
- Currency formatting utility
- Category metadata (colors, icons mapping)
- API types (from OpenAPI spec — wallets, transactions, dashboard, budgets, profile)

### Step 5: App Shell Layout
- `AppShell` component: header + scrollable content + bottom nav
- `Header` with month selector (left/right arrows + picker)
- `BottomNav` with 5 tabs (icons + labels)
- Responsive: mobile bottom nav, desktop sidebar (stretch goal)

### Step 6: Dashboard Page
- Monthly income/expense summary cards
- Net worth display
- Per-currency breakdown (if multi-currency)
- Recent transactions list (last 5)
- TanStack Query hook: `useDashboard(year, month)`

### Step 7: Wallets Pages
- **List page**: Wallet cards showing name, type, balance, currency
  - FAB or header button to create new wallet
- **Detail page**: Wallet info + balance history chart + filtered transactions
- **Create/Edit form**: Bottom sheet with name, type, balance, currency, account number
- TanStack Query hooks: `useWallets()`, `useWallet(id)`, `useWalletHistory(id, dateRange)`, `useCreateWallet()`, `useUpdateWallet()`, `useDeleteWallet()`

---

## Routes

```
/                    → Redirect to /dashboard
/login               → Login page (public)
/callback            → Auth0 callback (public)
/dashboard           → Dashboard page
/wallets             → Wallet list
/wallets/:id         → Wallet detail + history
/transactions        → Transaction list (future)
/budgets             → Budget overview (future)
/profile             → User profile (future)
```

---

## Verification

1. `npm run dev` — app loads, redirects to Auth0 login
2. After login — dashboard shows monthly data, month selector works
3. Navigate to wallets — list loads, create/edit/delete works
4. Month selector changes reflect on dashboard data immediately
5. `npm run build && npm run preview` — PWA installable, app shell cached
6. Lighthouse PWA audit passes core checks
