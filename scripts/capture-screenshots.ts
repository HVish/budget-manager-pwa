/**
 * Visual design audit — captures screenshots of every screen at multiple viewports.
 *
 * Usage:
 *   1. Start the dev server:  pnpm dev
 *   2. Capture all screens:   pnpm screenshots
 *   3. Capture one screen:    pnpm screenshots dashboard-loaded
 *   4. Capture by prefix:     pnpm screenshots wallet
 *
 * Available screen names:
 *   login, dashboard-loaded, dashboard-empty, wallets-loaded, wallets-empty,
 *   wallet-detail, wallet-create, wallet-edit
 *
 * Screenshots are saved to screenshots/<viewport>/<name>.png
 */

import { chromium, type Page, type Route } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const fixturesDir = resolve(root, 'screenshots/fixtures');
const outputDir = resolve(root, 'screenshots');

// ── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'mobile-small', width: 375, height: 812 },
  { name: 'mobile-large', width: 430, height: 932 },
] as const;

// ── Fixtures ────────────────────────────────────────────────────────────────

function loadFixture(name: string) {
  return JSON.parse(readFileSync(resolve(fixturesDir, `${name}.json`), 'utf-8'));
}

const fixtures = {
  wallets: loadFixture('wallets'),
  dashboard: loadFixture('dashboard'),
  budgetSummary: loadFixture('budget-summary'),
  walletHistory: loadFixture('wallet-history'),
};

const emptyDashboard = {
  ...fixtures.dashboard,
  totalIncome: 0,
  totalExpense: 0,
  netWorth: 0,
  summaries: [],
  recentTransactions: [],
};

// ── API mock handler ────────────────────────────────────────────────────────

type MockOverrides = {
  emptyWallets?: boolean;
  emptyDashboard?: boolean;
};

async function mockApi(route: Route, overrides: MockOverrides = {}) {
  const url = route.request().url();

  // Dashboard
  if (url.includes('/api/v1/dashboard')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides.emptyDashboard ? emptyDashboard : fixtures.dashboard),
    });
  }

  // Budget summary
  if (url.includes('/api/v1/budgets/summary')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixtures.budgetSummary),
    });
  }

  // Budgets list
  if (url.includes('/api/v1/budgets')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  }

  // Single wallet
  if (url.match(/\/api\/v1\/wallets\/\w+\/history/)) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixtures.walletHistory),
    });
  }

  if (url.match(/\/api\/v1\/wallets\/\w+$/) || url.match(/\/api\/v1\/wallets\/\w+\?/)) {
    const walletId = url.match(/\/wallets\/([\w-]+)/)?.[1];
    const wallet =
      fixtures.wallets.find((w: { id: string }) => w.id === walletId) ?? fixtures.wallets[0];
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(wallet),
    });
  }

  // Wallet list
  if (url.includes('/api/v1/wallets')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides.emptyWallets ? [] : fixtures.wallets),
    });
  }

  // Transactions
  if (url.includes('/api/v1/transactions')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        transactions: [],
        pagination: { nextCursor: null, hasMore: false, limit: 20 },
      }),
    });
  }

  // Fallback — let it through (shouldn't happen with mocks, but safe)
  return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
}

// ── Auth0 bypass ────────────────────────────────────────────────────────────

async function injectAuth(page: Page) {
  await page.addInitScript(() => {
    // Skip AuthGuard entirely — the flag is checked in auth-guard.tsx
    (window as Record<string, unknown>).__SCREENSHOT_MODE__ = true;

    // Zustand month store — April 2026 to match fixtures
    localStorage.setItem(
      'budget-month',
      JSON.stringify({ state: { year: 2026, month: 4 }, version: 0 }),
    );
  });
}

// ── Screenshot helpers ──────────────────────────────────────────────────────

async function waitForApp(page: Page) {
  // Wait for React to render — look for any non-loading content
  await page.waitForLoadState('networkidle');
  // Small extra wait for animations / React hydration
  await page.waitForTimeout(500);
}

interface ScreenshotDef {
  name: string;
  route: string;
  overrides?: MockOverrides;
  setup?: (page: Page) => Promise<void>;
}

const screens: ScreenshotDef[] = [
  // Login (no auth needed, separate handling)
  { name: 'login', route: '/login' },

  // Dashboard states
  { name: 'dashboard-loaded', route: '/dashboard' },
  { name: 'dashboard-empty', route: '/dashboard', overrides: { emptyDashboard: true } },

  // Wallets states
  { name: 'wallets-loaded', route: '/wallets' },
  { name: 'wallets-empty', route: '/wallets', overrides: { emptyWallets: true } },

  // Wallet detail
  { name: 'wallet-detail', route: '/wallets/w1' },

  // Create wallet (form)
  { name: 'wallet-create', route: '/wallets/new' },

  // Edit wallet (form) — uses w1 fixture data
  { name: 'wallet-edit', route: '/wallets/w1/edit' },
];

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Filter screens by CLI argument (prefix match)
  const filter = process.argv[2];
  const filteredScreens = filter ? screens.filter((s) => s.name.startsWith(filter)) : screens;

  if (filteredScreens.length === 0) {
    console.error(
      `No screens matching "${filter}". Available: ${screens.map((s) => s.name).join(', ')}`,
    );
    process.exit(1);
  }

  console.log(
    `Launching browser... (${filteredScreens.length} screen${filteredScreens.length > 1 ? 's' : ''})`,
  );
  const browser = await chromium.launch();
  const captured: string[] = [];

  for (const viewport of VIEWPORTS) {
    const dir = resolve(outputDir, viewport.name);
    mkdirSync(dir, { recursive: true });

    console.log(`\n── ${viewport.name} (${viewport.width}×${viewport.height}) ──`);

    for (const screen of filteredScreens) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 3,
        colorScheme: 'dark',
      });
      const page = await context.newPage();

      // Ensure dark class is set (app uses class-based dark mode, not media query)
      // Use a MutationObserver to add it as soon as <html> is available
      await page.addInitScript(() => {
        if (document.documentElement) {
          document.documentElement.classList.add('dark');
        }
        new MutationObserver((_mutations, observer) => {
          if (document.documentElement) {
            document.documentElement.classList.add('dark');
            observer.disconnect();
          }
        }).observe(document, { childList: true, subtree: true });
      });

      // Inject auth (except for login page)
      if (screen.route !== '/login') {
        await injectAuth(page);
      }

      // Set up API mocks
      await page.route('**/api/v1/**', (route) => mockApi(route, screen.overrides));

      // Block Auth0 network calls (prevent background token refresh noise)
      if (screen.route !== '/login') {
        await page.route('https://**auth0.com/**', (route) => route.abort('connectionrefused'));
      }

      // Navigate
      const url = `${BASE_URL}${screen.route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      } catch {
        console.log(`  ⚠ Timeout navigating to ${screen.route}, capturing anyway...`);
      }

      await waitForApp(page);

      // Run any custom setup
      if (screen.setup) {
        await screen.setup(page);
        await waitForApp(page);
      }

      // Capture
      const filePath = resolve(dir, `${screen.name}.png`);
      await page.screenshot({ path: filePath });
      captured.push(filePath);
      console.log(`  ✓ ${screen.name}.png`);

      await context.close();
    }
  }

  await browser.close();

  console.log(`\n── Done! ${captured.length} screenshots captured ──\n`);
  console.log('Files:');
  for (const file of captured) {
    console.log(`  ${file.replace(root + '/', '')}`);
  }
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
