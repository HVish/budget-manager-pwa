import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  /** 'sm' = 32px (mobile greeting), 'md' = 40px (desktop top bar) */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Auth0 user avatar with initials fallback.
 * Handles image load errors gracefully.
 */
export function UserAvatar({ size = 'sm', className }: UserAvatarProps) {
  const { user } = useAuth0();
  const [imgFailed, setImgFailed] = useState(false);

  const initials = user?.name?.[0]?.toUpperCase() ?? '?';
  const showImage = !!user?.picture && !imgFailed;
  const sizeClass = size === 'md' ? 'size-10' : 'size-8';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full',
        sizeClass,
        className,
      )}
    >
      {showImage ? (
        <img
          src={user.picture}
          alt={user?.name ?? 'User'}
          className={cn(
            'aspect-square size-full rounded-full object-cover',
            size === 'md' && 'ring-primary/20 ring-2',
          )}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className={cn(
            'flex size-full items-center justify-center rounded-full text-sm font-semibold',
            size === 'md'
              ? 'from-primary to-chart-2 text-primary-foreground ring-primary/20 bg-gradient-to-br ring-2'
              : 'bg-primary text-primary-foreground',
          )}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
