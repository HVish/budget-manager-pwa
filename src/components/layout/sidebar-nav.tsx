import { useLocation } from 'react-router';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  WalletCards,
  Settings,
  Plus,
  Tag,
} from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { useAppNavigate } from '@/lib/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/wallets', icon: WalletCards, label: 'Wallets' },
  { to: '/profile', icon: Settings, label: 'Settings' },
];

const createItems = [
  { to: '/transactions/new', icon: ArrowLeftRight, label: 'Transaction' },
  { to: '/wallets/new', icon: WalletCards, label: 'Wallet' },
  { to: '/budgets/new', icon: PiggyBank, label: 'Budget' },
  { to: '/categories/new', icon: Tag, label: 'Category' },
];

export function SidebarNav() {
  const navigate = useAppNavigate();
  const location = useLocation();

  return (
    <nav
      aria-label="Main navigation"
      className="border-border/50 bg-background supports-backdrop-filter:bg-background/60 fixed top-16 bottom-0 left-0 z-40 flex w-57.5 flex-col gap-1 border-r px-3.5 pt-5 backdrop-blur-xl"
    >
      {/* Google Drive-style "New" dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="bg-card ring-foreground/10 hover:ring-foreground/20 focus-visible:ring-ring/50 mb-5 inline-flex w-auto items-center gap-2.5 self-start rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-lg ring-1 transition-all outline-none hover:-translate-y-px hover:shadow-xl focus-visible:ring-3 active:translate-y-0">
          <Plus className="text-primary h-5 w-5" />
          <span className="text-foreground">New</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} className="w-50 rounded-xl p-1.5">
          {createItems.map(({ to, icon: Icon, label }) => (
            <DropdownMenuItem
              key={to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
              onClick={() => navigate(to)}
            >
              <Icon className="text-muted-foreground h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
        return (
          <AppLink
            key={to}
            to={to}
            className={() =>
              cn(
                'relative flex min-h-11 items-center gap-3.5 overflow-hidden rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-accent-soft text-accent-soft-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )
            }
          >
            {isActive && (
              <span className="bg-primary absolute top-0 bottom-0 left-0 w-1 rounded-r-full" />
            )}
            <Icon className={cn('size-5', !isActive && 'opacity-80')} />
            {label}
          </AppLink>
        );
      })}
    </nav>
  );
}
