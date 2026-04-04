import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setTokenGetter } from '@/api/client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      setTokenGetter(() => getAccessTokenSilently());
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div className="bg-background flex h-dvh items-center justify-center">
        <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
      </div>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  return <>{children}</>;
}
