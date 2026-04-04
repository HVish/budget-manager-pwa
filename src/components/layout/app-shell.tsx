import { Outlet } from 'react-router';
import { BottomNav } from './bottom-nav';
import { useKeyboardOpen } from '@/hooks/use-keyboard-open';
import { cn } from '@/lib/utils';

export default function AppShell() {
  const keyboardOpen = useKeyboardOpen();

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <main
        className={cn(
          'flex-1 overflow-y-auto transition-[padding-bottom] duration-200',
          keyboardOpen ? 'pb-4' : 'pb-24',
        )}
      >
        <Outlet />
      </main>
      <BottomNav
        className={cn(
          'transition-transform duration-200 ease-in-out',
          keyboardOpen && 'pointer-events-none translate-y-full',
        )}
      />
    </div>
  );
}
