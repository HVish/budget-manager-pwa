import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { flushSync } from 'react-dom';
import { resetScrollPosition } from '@/lib/scroll';

type TransitionType = 'tab-switch' | 'push' | 'pop' | 'modal-present' | 'modal-dismiss' | 'fade';

const TAB_ROUTES = new Set(['/dashboard', '/wallets', '/transactions', '/budgets']);
const MODAL_ROUTE_PATTERNS = [
  /\/wallets\/new$/,
  /\/wallets\/[^/]+\/edit$/,
  /\/transactions\/new$/,
  /\/budgets\/new$/,
  /\/budgets\/[^/]+\/edit$/,
];

/** Navigation API types — not yet in all TS lib versions */
interface NavigateEventLike extends Event {
  navigationType: string;
  canIntercept: boolean;
  hasUAVisualTransition: boolean;
  destination: { url: string };
  intercept(options: { handler: () => Promise<void> }): void;
}

function isTabRoute(path: string): boolean {
  return TAB_ROUTES.has(path);
}

function isModalRoute(path: string): boolean {
  return MODAL_ROUTE_PATTERNS.some((re) => re.test(path));
}

function normalize(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function getTransitionType(rawFrom: string, rawTo: string): TransitionType {
  const from = normalize(rawFrom);
  const to = normalize(rawTo);

  if (isTabRoute(from) && isTabRoute(to)) return 'tab-switch';
  if (isModalRoute(to) && !isModalRoute(from)) return 'modal-present';
  if (isModalRoute(from) && !isModalRoute(to)) return 'modal-dismiss';
  if (to.startsWith(from + '/') && !isModalRoute(to)) return 'push';
  if (from.startsWith(to + '/') && !isModalRoute(from)) return 'pop';
  return 'fade';
}

/** Flag so our popstate fallback listener ignores synthetic dispatches. */
let isSyntheticPopstate = false;

// ---------------------------------------------------------------------------
// Programmatic navigation
// ---------------------------------------------------------------------------

export function useAppNavigate() {
  const routerNavigate = useNavigate();
  const location = useLocation();

  return (to: string | -1, options?: { replace?: boolean; state?: unknown }) => {
    if (to === -1) {
      // history.go(-1) fires popstate asynchronously.
      // The Navigation API handler will intercept the traverse and animate it.
      routerNavigate(-1);
      return;
    }

    const from = location.pathname;
    const type = getTransitionType(from, to);

    if (!document.startViewTransition) {
      routerNavigate(to, options);
      return;
    }

    document.documentElement.dataset.vtType = type;

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        routerNavigate(to, options);
      });
      resetScrollPosition();
    });

    transition.finished.finally(() => {
      delete document.documentElement.dataset.vtType;
    });
  };
}

// ---------------------------------------------------------------------------
// Browser back/forward with view transitions
// ---------------------------------------------------------------------------

/**
 * Intercepts browser back/forward and wraps the update in a view transition.
 *
 * Strategy 1 — Navigation API (Chrome 105+):
 *   `event.intercept()` prevents the default popstate. Inside the handler
 *   we start a view transition and dispatch a synthetic popstate wrapped in
 *   `flushSync` so React Router processes it synchronously while the old
 *   DOM snapshot is held.
 *
 * Strategy 2 — popstate fallback (Safari/Firefox):
 *   Capture-phase listener starts a view transition before React Router
 *   sees the event. Uses a timeout to wait for React to render.
 */
export function usePopstateViewTransitions() {
  const location = useLocation();
  const lastPathRef = useRef(location.pathname);

  useEffect(() => {
    lastPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!document.startViewTransition) return;

    // --- Strategy 1: Navigation API (Chrome 105+) ---
    if ('navigation' in window) {
      const nav = (window as { navigation: EventTarget }).navigation;

      function handleNavigate(e: Event) {
        const event = e as NavigateEventLike;

        if (event.navigationType !== 'traverse') return;
        if (!event.canIntercept) return;
        if (event.hasUAVisualTransition) return;

        const from = normalize(lastPathRef.current);
        const to = normalize(new URL(event.destination.url).pathname);
        if (from === to) return;

        const type = getTransitionType(from, to);

        event.intercept({
          async handler() {
            document.documentElement.dataset.vtType = type;

            const transition = document.startViewTransition(() => {
              flushSync(() => {
                isSyntheticPopstate = true;
                window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
                isSyntheticPopstate = false;
              });
              resetScrollPosition();
            });

            await transition.finished;
            delete document.documentElement.dataset.vtType;
          },
        });
      }

      nav.addEventListener('navigate', handleNavigate);
      return () => nav.removeEventListener('navigate', handleNavigate);
    }

    // --- Strategy 2: popstate fallback (Safari/Firefox) ---
    function handlePopstate(event: PopStateEvent) {
      if (isSyntheticPopstate) return;
      if ((event as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition)
        return;

      const newPath = window.location.pathname;
      const oldPath = lastPathRef.current;
      if (normalize(newPath) === normalize(oldPath)) return;

      const type = getTransitionType(oldPath, newPath);
      document.documentElement.dataset.vtType = type;

      // Start view transition, wait for React to render via timeout fallback
      const transition = document.startViewTransition(
        () => new Promise<void>((resolve) => setTimeout(resolve, 150)),
      );

      transition.finished.finally(() => {
        delete document.documentElement.dataset.vtType;
      });
    }

    window.addEventListener('popstate', handlePopstate, { capture: true });
    return () => window.removeEventListener('popstate', handlePopstate, { capture: true });
  }, []);
}
