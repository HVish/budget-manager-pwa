import { useSyncExternalStore } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const TABLET_QUERY = '(min-width: 768px)';
const DESKTOP_QUERY = '(min-width: 1024px)';

// Cache MediaQueryList objects at module level — avoids creating new instances per call
let _tabletMql: MediaQueryList | null = null;
let _desktopMql: MediaQueryList | null = null;

function getTabletMql() {
  return (_tabletMql ??= window.matchMedia(TABLET_QUERY));
}
function getDesktopMql() {
  return (_desktopMql ??= window.matchMedia(DESKTOP_QUERY));
}

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'mobile';
  if (getDesktopMql().matches) return 'desktop';
  if (getTabletMql().matches) return 'tablet';
  return 'mobile';
}

function subscribe(callback: () => void): () => void {
  const tablet = getTabletMql();
  const desktop = getDesktopMql();
  tablet.addEventListener('change', callback);
  desktop.addEventListener('change', callback);
  return () => {
    tablet.removeEventListener('change', callback);
    desktop.removeEventListener('change', callback);
  };
}

const serverSnapshot: Breakpoint = 'mobile';

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getBreakpoint, () => serverSnapshot);
}

export function useIsDesktop(): boolean {
  return useBreakpoint() === 'desktop';
}

/** Non-hook check for use in event handlers that can't call hooks. */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return getDesktopMql().matches;
}
