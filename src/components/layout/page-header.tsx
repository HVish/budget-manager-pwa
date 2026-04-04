import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Settings } from 'lucide-react';
import { MonthSelectorSheet } from '@/components/month-selector';
import { useAppNavigate } from '@/lib/navigation';
import { getGreeting } from '@/lib/date';

interface PageHeaderProps {
  title: string;
  showMonthPicker?: boolean;
}

export function PageHeader({ title, showMonthPicker = true }: PageHeaderProps) {
  const { user } = useAuth0();
  const navigate = useAppNavigate();
  const [imgFailed, setImgFailed] = useState(false);

  const initials = user?.name?.[0]?.toUpperCase() ?? '?';
  const greeting = getGreeting();
  const showImage = !!user?.picture && !imgFailed;

  return (
    <header className="px-4">
      {/* Row 1: Greeting bar */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <div className="flex items-center">
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full">
            {showImage ? (
              <img
                src={user.picture}
                alt={user?.name ?? 'User'}
                className="aspect-square size-full rounded-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="bg-primary text-primary-foreground flex size-full items-center justify-center rounded-full text-sm font-semibold">
                {initials}
              </span>
            )}
          </div>
          <span className="text-muted-foreground ml-3 text-sm">{greeting},</span>
        </div>
        <button
          onClick={() => navigate('/profile')}
          aria-label="Settings"
          className="bg-card ring-foreground/10 flex min-h-11 min-w-11 items-center justify-center rounded-full ring-1"
        >
          <Settings className="text-muted-foreground h-5 w-5" />
        </button>
      </div>

      {/* Row 2: Title + month pill */}
      <div className="flex items-center justify-between pt-1 pb-4">
        <h1 className="text-foreground text-2xl font-bold">{title}</h1>
        {showMonthPicker && <MonthSelectorSheet />}
      </div>
    </header>
  );
}
