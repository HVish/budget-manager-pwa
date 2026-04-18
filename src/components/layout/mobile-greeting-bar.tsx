import { Settings } from 'lucide-react';
import { MonthSelectorSheet } from '@/components/month-selector';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAppNavigate } from '@/lib/navigation';
import { getGreeting } from '@/lib/date';

/**
 * Mobile-only greeting bar: avatar + greeting + month picker + settings button.
 * Rendered by AppShell above the Outlet — this is shell chrome, not page content.
 */
export function MobileGreetingBar() {
  const navigate = useAppNavigate();
  const greeting = getGreeting();

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <div className="flex items-center">
        <UserAvatar size="sm" />
        <span className="text-muted-foreground ml-3 text-sm">{greeting},</span>
      </div>
      <div className="flex items-center gap-2">
        <MonthSelectorSheet />
        <button
          onClick={() => navigate('/profile')}
          aria-label="Settings"
          className="bg-wallet-card ring-foreground/10 flex min-h-11 min-w-11 items-center justify-center rounded-full ring-1"
        >
          <Settings className="text-muted-foreground h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
