# Visual Screenshot Audit

Playwright-based tool that captures screenshots of every screen for design review.

## Prerequisites

The dev server must be running: `pnpm dev`

## Usage

```sh
pnpm screenshots                    # Capture all screens
pnpm screenshots dashboard-loaded   # Capture a specific screen by name
pnpm screenshots wallet             # Capture by prefix (all wallet screens)
```

## Available Screens

| Name                  | Route               | Description                        |
| --------------------- | ------------------- | ---------------------------------- |
| `landing`             | `/`                 | Public landing page (unauthenticated) |
| `dashboard-loaded`    | `/dashboard`        | Dashboard with mock financial data |
| `dashboard-empty`     | `/dashboard`        | Dashboard with zero balances       |
| `wallets-loaded`      | `/wallets`          | Wallet list with grouped cards     |
| `wallets-empty`       | `/wallets`          | Empty state — no wallets           |
| `wallet-detail`       | `/wallets/w1`       | Single wallet with balance chart   |
| `wallet-create`       | `/wallets/new`      | Create wallet form (empty)         |
| `wallet-edit`         | `/wallets/w1/edit`  | Edit wallet form (pre-filled)      |
| `transactions-loaded` | `/transactions`     | Transaction list with date groups  |
| `transactions-empty`  | `/transactions`     | Empty state — no transactions      |
| `transaction-create`  | `/transactions/new` | Create transaction form (empty)    |
| `budgets-loaded`      | `/budgets`          | Budget list with category cards    |
| `budgets-empty`       | `/budgets`          | Empty state — no budgets           |
| `budget-create`       | `/budgets/new`      | Create budget form (empty)         |
| `budget-edit`         | `/budgets/b1/edit`  | Edit budget form (pre-filled)      |
| `settings`            | `/profile`          | Settings page with profile + prefs |

## Output

Screenshots are saved to `screenshots/<viewport>/<name>.png` at three viewports:

| Viewport       | Size       | Device reference  |
| -------------- | ---------- | ----------------- |
| `mobile-small` | 375 x 812  | iPhone SE         |
| `mobile-large` | 430 x 932  | iPhone 15 Pro Max |
| `desktop`      | 1280 x 800 | Laptop            |

All captures use 3x device scale factor with dark color scheme.

Desktop screenshots show the `DesktopShell` layout (sidebar + top bar + centered content). Mobile screenshots show the `AppShell` layout (bottom nav + FAB + greeting bar).

## How It Works

- **Auth bypass**: Sets `window.__SCREENSHOT_MODE__` flag, checked by `AuthGuard` in `src/features/auth/auth-guard.tsx`
- **API mocking**: All API calls are intercepted via Playwright `page.route()` and return fixture data from `screenshots/fixtures/`
- **Dark mode**: Injects `dark` class on `<html>` via MutationObserver
- **Month store**: Sets Zustand month store to April 2026 to match fixture dates

## Fixtures

Mock data lives in `screenshots/fixtures/`:

| File                  | Contents                                    |
| --------------------- | ------------------------------------------- |
| `wallets.json`        | 6 wallets across all types (INR)            |
| `dashboard.json`      | Monthly summary with 5 recent transactions  |
| `budget-summary.json` | 3 budget categories at different thresholds |
| `wallet-history.json` | 7 balance history points for sparkline      |
| `transactions.json`   | 7 transactions across 3 dates (INR)         |

## Adding a New Screen

1. Add a `ScreenshotDef` entry to the `screens` array in `scripts/capture-screenshots.ts`
2. Add any new fixtures needed in `screenshots/fixtures/`
3. Update the **Available Screens** table above
4. Run `pnpm screenshots <new-name>` to verify

## Design Reference

Compare screenshots against `DESIGN.md` (project root) for the full design system spec — color tokens, spacing, typography, component patterns, and layout rules.
