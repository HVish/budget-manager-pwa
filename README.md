# Budget Manager PWA

Personal budget management Progressive Web App built with React. Track wallets, transactions, and monthly budgets with a mobile-first dark-themed UI.

## Tech Stack

| Concern      | Choice                         |
| ------------ | ------------------------------ |
| Framework    | React 19 + TypeScript + Vite 8 |
| Styling      | Tailwind CSS v4 + shadcn/ui    |
| Client state | Zustand (with localStorage)    |
| Server state | TanStack Query v5              |
| Routing      | React Router v7                |
| Auth         | Auth0                          |
| HTTP client  | ky                             |
| Charts       | Recharts                       |
| Package mgr  | pnpm                           |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A running [Budget Manager API](../budget-manager-api/) instance

### Environment

Create a `.env.local` file:

```env
VITE_API_ORIGIN=https://your-api-host.com
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-auth0-audience
```

### Install & Run

```sh
pnpm install
pnpm dev          # Starts dev server with HTTPS (mkcert)
```

### Other Commands

```sh
pnpm build            # Type-check + production build
pnpm lint             # ESLint
pnpm format           # Prettier (write)
pnpm format:check     # Prettier (check only)
pnpm screenshots      # Capture screen screenshots (dev server must be running)
```

## Project Structure

```
src/
├── api/            # ky client + TanStack Query hooks per resource
├── components/
│   ├── ui/         # shadcn/ui primitives + AppLink
│   └── layout/     # app-shell, bottom-nav, page-header, page-header-bar
├── features/       # Feature pages (auth, dashboard, wallets)
├── stores/         # Zustand stores
├── lib/            # Utilities (currency, date, categories, navigation)
├── styles/         # Tailwind + CSS variables + view transitions
├── routes.tsx      # Route definitions
├── App.tsx         # Auth0Provider + QueryClient + Router
└── main.tsx        # Entry point + service worker registration
```

## Key Features

- **Dark theme** with green-tinted oklch color tokens
- **View transitions** using the View Transition API with direction-aware animations (push, pop, modal, tab-switch)
- **PWA** with service worker (network-first HTML, cache-first hashed assets)
- **Mobile-first** layout with bottom navigation, FAB, and safe area insets

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** — Conventions, commands, and project rules
- **[DESIGN.md](./DESIGN.md)** — Complete design system spec
- **[docs/decisions.md](./docs/decisions.md)** — Architectural decision records
- **[docs/openapi.yaml](./docs/openapi.yaml)** — API spec (source of truth for types)

## Git Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`

Pre-commit hooks run lint-staged (ESLint + Prettier) automatically via Husky.
