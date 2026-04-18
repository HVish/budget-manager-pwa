import { Outlet } from 'react-router';
import { BottomNav } from './bottom-nav';
import { DesktopShell } from './desktop-shell';
import { MobileGreetingBar } from './mobile-greeting-bar';
import { LayoutProvider, COMPACT_LAYOUT } from './layout-context';
import { useKeyboardOpen } from '@/hooks/use-keyboard-open';
import { useIsDesktop } from '@/hooks/use-breakpoint';
import { cn } from '@/lib/utils';

export default function AppShell() {
  const keyboardOpen = useKeyboardOpen();
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <DesktopShell>
        <Outlet />
      </DesktopShell>
    );
  }

  return (
    <LayoutProvider value={COMPACT_LAYOUT}>
      <div className="bg-background flex min-h-dvh flex-col">
        <main
          className={cn(
            'flex-1 overflow-y-auto pt-[env(safe-area-inset-top)] transition-[padding-bottom] duration-200',
            keyboardOpen ? 'pb-4' : 'pb-24',
          )}
        >
          <MobileGreetingBar />
          <Outlet />
        </main>
        <BottomNav
          className={cn(
            'transition-transform duration-200 ease-in-out',
            keyboardOpen && 'pointer-events-none translate-y-full',
          )}
        />
      </div>
    </LayoutProvider>
  );
}
