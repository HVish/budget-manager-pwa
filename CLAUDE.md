# Budget Manager PWA

Personal budget management Progressive Web App — React frontend for the Budget Manager API.

## Quick Reference

- **Plan**: `docs/plan.md` — full implementation plan and design decisions
- **API spec**: `docs/openapi.yaml` — OpenAPI 3.0.3 spec (source of truth for types, endpoints, field names)
- **API source repo**: `/Users/sakshee/vishnu/budget-manager-api/` — always check `docs/openapi.yaml` there for the latest spec

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova style) |
| Client state | Zustand (with localStorage persistence) |
| Server state | TanStack Query v5 |
| Routing | React Router v7 |
| Auth | @auth0/auth0-react |
| HTTP client | ky |
| Charts | Recharts |
| Icons | lucide-react |
| Dates | date-fns |
| Package manager | pnpm |

## Project Structure

```
src/
├── api/
│   ├── client.ts          # ky instance with Auth0 token interceptor
│   ├── types.ts           # TypeScript types matching OpenAPI spec (camelCase)
│   └── hooks/             # TanStack Query hooks per resource
├── components/
│   ├── ui/                # shadcn/ui primitives (do not edit manually — use `pnpm dlx shadcn@latest add`)
│   ├── layout/            # app-shell, header, bottom-nav
│   └── *.tsx              # shared components (month-selector, etc.)
├── features/              # feature pages grouped by domain
│   ├── auth/
│   ├── dashboard/
│   └── wallets/
├── stores/                # Zustand stores
├── lib/                   # Utilities (currency, date, categories, cn)
├── styles/
│   └── globals.css        # Tailwind + shadcn CSS variables
├── routes.tsx             # Route definitions
├── App.tsx                # Auth0Provider → QueryClient → Router
└── main.tsx               # Entry point
```

## Commands

```sh
pnpm dev          # Start dev server
pnpm build        # Type-check + production build
pnpm preview      # Preview production build
pnpm lint         # ESLint
```

## Conventions

### API

- **`VITE_API_ORIGIN`** env var holds just the host (e.g. `https://budgetmanager.vishnusingh.in`), no path.
- Every API call includes the version prefix explicitly: `api.get("api/v1/wallets")`. This keeps endpoints decoupled — individual calls can migrate to v2 independently.
- API types use **camelCase** field names matching the OpenAPI spec. Never assume API shapes — always reference `docs/openapi.yaml`.
- Transactions use **cursor-based pagination** (`nextCursor` + `hasMore`), not offset-based.
- Amounts are **signed int64 minor units** (negative = debit, positive = credit).

### Styling

- Dark mode is the default (`<html class="dark">`).
- Mobile-first layout with bottom navigation and safe area insets.
- Use `cn()` from `@/lib/utils` for conditional class merging.
- shadcn components live in `src/components/ui/` — add new ones via CLI, don't write them by hand.

### State

- **Month store** (Zustand): global month/year selection, persisted to localStorage. All date-scoped queries depend on this.
- **Server state** (TanStack Query): all API data. Query keys follow `[resource, filters]` convention.

### Categories

Categories are uppercase strings from the API: `SALARY`, `FREELANCE`, `INVESTMENT`, `GROCERIES`, `TRANSPORT`, `ENTERTAINMENT`, `SHOPPING`, `FOOD`, `UTILITIES`, `HOUSING`, `DEBT`, `HEALTH`, `OTHER`, `CORRECTION`, `TRANSFER`.

### Wallet Types

`checking | savings | cash | credit | investment`

### Currencies

`USD | INR | EUR | GBP | JPY | AUD | CAD` — use `Intl.NumberFormat` with `en-IN` locale for display.
