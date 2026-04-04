import { useNavigate, useLocation } from 'react-router';

type TransitionType = 'tab-switch' | 'push' | 'pop' | 'modal-present' | 'modal-dismiss' | 'fade';

const TAB_ROUTES = new Set(['/dashboard', '/wallets', '/transactions', '/budgets']);

const MODAL_ROUTE_PATTERNS = [/\/wallets\/new$/, /\/wallets\/[^/]+\/edit$/];

function isTabRoute(path: string): boolean {
  return TAB_ROUTES.has(path);
}

function isModalRoute(path: string): boolean {
  return MODAL_ROUTE_PATTERNS.some((re) => re.test(path));
}

/** Strip trailing slash for consistent path comparison. */
function normalize(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function getTransitionType(rawFrom: string, rawTo: string): TransitionType {
  const from = normalize(rawFrom);
  const to = normalize(rawTo);

  // Tab-to-tab: cross-fade
  if (isTabRoute(from) && isTabRoute(to)) return 'tab-switch';

  // Entering a modal (create/edit) route
  if (isModalRoute(to) && !isModalRoute(from)) return 'modal-present';

  // Leaving a modal route
  if (isModalRoute(from) && !isModalRoute(to)) return 'modal-dismiss';

  // List -> detail (push)
  // e.g. /wallets -> /wallets/abc-123
  if (to.startsWith(from + '/') && !isModalRoute(to)) return 'push';

  // Detail -> list (pop)
  // e.g. /wallets/abc-123 -> /wallets
  if (from.startsWith(to + '/') && !isModalRoute(from)) return 'pop';

  // Default
  return 'fade';
}

function cleanupVtType(): void {
  delete document.documentElement.dataset.vtType;
}

/**
 * Wait for any running view-transition animations to finish, then clean up
 * the data-vt-type attribute. Uses a generous timeout as a fallback since
 * view-transition pseudo-element animations may start with a slight delay.
 */
function cleanupAfterTransition(): void {
  // Use a timeout slightly longer than the longest transition duration (350ms modal-in)
  // to ensure animations have fully completed before cleanup
  setTimeout(cleanupVtType, 500);
}

export function useAppNavigate() {
  const routerNavigate = useNavigate();
  const location = useLocation();

  return (to: string, options?: { replace?: boolean; state?: unknown }) => {
    const type = getTransitionType(location.pathname, to);
    document.documentElement.dataset.vtType = type;
    routerNavigate(to, { ...options, viewTransition: true });
    cleanupAfterTransition();
  };
}
