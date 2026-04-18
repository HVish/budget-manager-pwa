import { useAuth0 } from '@auth0/auth0-react';
import { MonthSelectorSheet } from '@/components/month-selector';
import { UserAvatar } from '@/components/ui/user-avatar';
import { getGreeting } from '@/lib/date';

export function TopBar() {
  const { user } = useAuth0();
  const greeting = getGreeting();

  return (
    <header className="border-border/50 bg-background/85 supports-backdrop-filter:bg-background/60 fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b px-8 backdrop-blur-xl">
      <div className="flex items-center gap-3.5">
        <UserAvatar size="md" />
        <div>
          <p className="text-muted-foreground text-xs tracking-wide">{greeting},</p>
          <p className="text-foreground text-[15px] font-semibold">{user?.name ?? 'User'}</p>
        </div>
      </div>
      <MonthSelectorSheet />
    </header>
  );
}
