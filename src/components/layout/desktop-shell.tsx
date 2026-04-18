import type { ReactNode } from 'react';
import { TopBar } from './top-bar';
import { SidebarNav } from './sidebar-nav';
import { LayoutProvider, EXPANDED_LAYOUT } from './layout-context';

const MAIN_CONTENT_STYLE = { viewTransitionName: 'main-content' } as const;

/**
 * Desktop chrome: top bar + sidebar + padded max-width content area.
 * Provides { variant: 'expanded', safeAreaHandled: true } via LayoutContext.
 */
export function DesktopShell({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider value={EXPANDED_LAYOUT}>
      <div className="bg-background min-h-dvh">
        <TopBar />
        <SidebarNav />
        <main className="mt-16 ml-[230px] min-h-[calc(100dvh-4rem)] px-10 py-9">
          <div className="mx-auto max-w-[650px]" style={MAIN_CONTENT_STYLE}>
            {children}
          </div>
        </main>
      </div>
    </LayoutProvider>
  );
}
