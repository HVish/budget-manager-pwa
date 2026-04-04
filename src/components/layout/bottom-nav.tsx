import { NavLink, useLocation } from 'react-router';
import { LayoutDashboard, WalletCards, ArrowLeftRight, PiggyBank, Plus } from 'lucide-react';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';

const leftNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/wallets', icon: WalletCards, label: 'Wallets' },
];

const rightNavItems = [
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: PiggyBank, label: 'Budget' },
];

function setTabTransitionType() {
  document.documentElement.dataset.vtType = 'tab-switch';
}

export function BottomNav({ className }: { className?: string }) {
  const navigate = useAppNavigate();
  const location = useLocation();
  const isWalletsPage = location.pathname === '/wallets';

  return (
    <nav
      className={cn(
        'border-border bg-background/95 supports-backdrop-filter:bg-background/60 fixed right-0 bottom-0 left-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur',
        className,
      )}
    >
      <div className="relative flex h-16 items-center justify-around px-2">
        {/* Left tabs */}
        {leftNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            viewTransition
            onClick={setTabTransitionType}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 min-w-11 flex-col items-center gap-1 px-3 py-2 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* FAB spacer */}
        <div className="w-16" />

        {/* Right tabs */}
        {rightNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            viewTransition
            onClick={setTabTransitionType}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 min-w-11 flex-col items-center gap-1 px-3 py-2 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Center FAB */}
        <button
          aria-label={isWalletsPage ? 'Add wallet' : 'Add transaction'}
          onClick={() => navigate(isWalletsPage ? '/wallets/new' : '/transactions/new')}
          className="bg-primary text-primary-foreground shadow-primary/25 ring-background absolute -top-5 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full shadow-lg ring-2 transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
}
