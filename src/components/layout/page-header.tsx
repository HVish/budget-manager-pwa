import { useAuth0 } from '@auth0/auth0-react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MonthSelectorSheet } from '@/components/month-selector';
import { getGreeting } from '@/lib/date';

interface PageHeaderProps {
  title: string;
  showMonthPicker?: boolean;
}

export function PageHeader({ title, showMonthPicker = true }: PageHeaderProps) {
  const { user } = useAuth0();
  const navigate = useNavigate();

  const initials = user?.name?.[0]?.toUpperCase() ?? '?';
  const greeting = getGreeting();

  return (
    <header className="px-4">
      {/* Row 1: Greeting bar */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <div className="flex items-center">
          <Avatar size="default">
            {user?.picture && <AvatarImage src={user.picture} alt={user.name ?? 'User'} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground ml-3 text-sm">{greeting},</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11"
          onClick={() => navigate('/profile')}
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Row 2: Title + month pill */}
      <div className="flex items-center justify-between pt-1 pb-4">
        <h1 className="text-foreground text-2xl font-bold">{title}</h1>
        {showMonthPicker && <MonthSelectorSheet />}
      </div>
    </header>
  );
}
