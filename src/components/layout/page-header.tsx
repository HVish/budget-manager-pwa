import type { ReactNode } from 'react';
import { useLayout } from './layout-context';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  /** Optional trailing content (actions, filters, etc.) */
  children?: ReactNode;
}

/**
 * Page title header for tab pages (dashboard, wallets, transactions, budgets).
 * The greeting bar and month picker are shell-level chrome handled by
 * AppShell (MobileGreetingBar) and DesktopShell (TopBar).
 */
export function PageHeader({ title, children }: PageHeaderProps) {
  const { variant } = useLayout();
  const isCompact = variant === 'compact';

  return (
    <header className={cn(isCompact && 'px-4')}>
      <div className={cn('flex items-center justify-between', isCompact ? 'pt-1 pb-4' : 'pb-7')}>
        <h1
          className={cn(
            'text-foreground text-2xl font-bold',
            !isCompact && 'text-[26px] tracking-tight',
          )}
        >
          {title}
        </h1>
        {children}
      </div>
    </header>
  );
}
