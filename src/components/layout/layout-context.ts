import { createContext, useContext } from 'react';

export type LayoutVariant = 'compact' | 'expanded';

export interface LayoutContextValue {
  /** 'compact' = mobile shell (BottomNav), 'expanded' = desktop shell (TopBar+Sidebar) */
  variant: LayoutVariant;
  /** true when the shell already handles safe-area-inset-top padding */
  safeAreaHandled: boolean;
}

const LayoutCtx = createContext<LayoutContextValue | null>(null);

export const LayoutProvider = LayoutCtx.Provider;

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutCtx);
  if (!ctx) {
    throw new Error('useLayout must be used within a LayoutProvider (AppShell or DesktopShell)');
  }
  return ctx;
}

/** Pre-built layout values — avoids creating new objects on every render */
export const COMPACT_LAYOUT: LayoutContextValue = { variant: 'compact', safeAreaHandled: true };
export const COMPACT_LAYOUT_NO_SAFE_AREA: LayoutContextValue = {
  variant: 'compact',
  safeAreaHandled: false,
};
export const EXPANDED_LAYOUT: LayoutContextValue = { variant: 'expanded', safeAreaHandled: true };
