# Budget Manager PWA

Personal budget management Progressive Web App — React frontend for the Budget Manager API.

## Quick Reference

- **API spec**: `docs/openapi.yaml` — source of truth for types, endpoints, field names
- **API source repo**: `/Users/sakshee/vishnu/budget-manager-api/` — check `docs/openapi.yaml` there for latest spec
- **Decision records**: `docs/decisions.md` — key architectural and design decisions with rationale

## Tech Stack

| Concern      | Choice                                        |
| ------------ | --------------------------------------------- |
| Framework    | React 19 + TypeScript + Vite 8                |
| Styling      | Tailwind CSS v4 + shadcn/ui (base-nova style) |
| Client state | Zustand (with localStorage persistence)       |
| Server state | TanStack Query v5                             |
| Routing      | React Router v7                               |
| Auth         | @auth0/auth0-react                            |
| HTTP client  | ky                                            |
| Charts       | Recharts                                      |
| Icons        | lucide-react                                  |
| Dates        | date-fns                                      |
| Package mgr  | pnpm                                          |
| Formatting   | Prettier + prettier-plugin-tailwindcss        |
| Linting      | ESLint                                        |
| Git hooks    | Husky + lint-staged + commitlint              |

## Commands

```sh
pnpm dev            # Start dev server
pnpm build          # Type-check + production build
pnpm lint           # ESLint + Tailwind canonical class linter
pnpm format         # Prettier (write)
pnpm format:check   # Prettier (check only, for CI)
pnpm screenshots    # Capture all screen screenshots (dev server must be running)
pnpm screenshots X  # Capture specific screen(s) by name/prefix
```

## Git Workflow

- **Pre-commit hook** runs `lint-staged` — auto-formats and lints staged files.
- **Commit messages** must follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`, `ci`, `build`
  - Examples: `feat: add budget progress card`, `fix: correct chart color token`
- Do **not** skip hooks (`--no-verify`) unless explicitly asked.

## Documentation

- Design specs and implementation plans are **temporary** — use them during active development, then delete once the feature is stable.
- Distill important decisions (what, why, what was rejected) into `docs/decisions.md` before deleting specs.
- Decision records are living documents — override entries when decisions change, don't append "v2".
- **Prune regularly:** Delete a decision when (a) the "why" is obvious from the code, (b) there's no realistic alternative anymore, or (c) a new engineer would make the right choice without it. Merge related entries as they accumulate.
- Don't keep verbose docs around "just in case" — the code and git history are the source of truth.

## Project Structure

```
src/
├── api/            # ky client + TanStack Query hooks per resource
├── components/
│   ├── ui/         # shadcn/ui primitives (scaffold via CLI, then customize freely)
│   └── layout/     # app-shell, bottom-nav, page-header
├── features/       # Feature pages (auth, dashboard, wallets)
├── stores/         # Zustand stores
├── lib/            # Utilities (currency, date, categories, cn)
├── styles/         # Tailwind + shadcn CSS variables (green-tinted dark theme)
├── routes.tsx      # Route definitions
├── App.tsx         # Auth0Provider → QueryClient → Router
└── main.tsx        # Entry point
```

## Conventions

### API

- `VITE_API_ORIGIN` env var = host only (e.g. `https://budgetmanager.vishnusingh.in`).
- Version prefix in every call: `api.get("api/v1/wallets")` — endpoints migrate independently.
- Types use **camelCase** matching the OpenAPI spec. Never assume shapes — reference `docs/openapi.yaml`.
- Transactions use **cursor-based pagination** (`nextCursor` + `hasMore`).
- Amounts are **signed int64 minor units** (negative = debit, positive = credit).

### Styling

- Dark mode default (`<html class="dark">`) with green-tinted oklch color tokens.
- Mobile-first layout with bottom navigation, FAB, and safe area insets.
- Use `cn()` from `@/lib/utils` for conditional class merging — no template literal concatenation.
- shadcn components live in `src/components/ui/` — scaffold new ones via `pnpm dlx shadcn@latest add <name>`, then customize freely. Don't re-run the add command on already-customized components (it overwrites). Don't hand-write a shadcn primitive from scratch — always start from the generated output.
- Semantic color tokens: `text-income` / `text-expense` for financial values.

### State

- **Month store** (Zustand): global month/year selection, persisted to localStorage.
- **Server state** (TanStack Query): query keys follow `[resource, filters]` convention.

## Screenshots & Visual Audit

- **Reference doc**: `docs/screenshots.md` — available screens, viewports, fixtures, and how to add new screens.
- **Design system**: `DESIGN.md` — color tokens, spacing, typography, component patterns for comparison.
- When adding or modifying a screen/route, update `scripts/capture-screenshots.ts` (add a `ScreenshotDef` entry) and the **Available Screens** table in `docs/screenshots.md`.
- Screenshots output to `screenshots/` (gitignored). Fixtures live in `screenshots/fixtures/`.

## Code Review Process

When asked to review code, always run **both** of these review agents in parallel:

1. **designer** — Reviews UI code for design accuracy, spacing, color tokens, touch targets, accessibility, interaction states, and theme consistency. Fixes issues directly.
2. **architect** — Reviews code for architecture, data flow, performance, conventions, TypeScript correctness, and edge cases. Fixes issues directly.

Both agents should read the relevant source files and `docs/decisions.md` for context. Issues should be categorized as MUST FIX, SHOULD FIX, or NICE TO HAVE, and fixed directly in the code when possible.
