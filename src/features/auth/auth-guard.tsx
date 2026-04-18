import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useRef, useState } from 'react';
import { setLogout, setTokenGetter, setTokenRefresher } from '@/api/client';
import { api } from '@/api/client';
import { useLocaleSync } from '@/hooks/use-locale-sync';

const isScreenshotMode = Boolean(
  (window as unknown as Record<string, unknown>).__SCREENSHOT_MODE__,
);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
    getIdTokenClaims,
    logout,
  } = useAuth0();
  const [isUserSynced, setIsUserSynced] = useState(false);
  const syncAttempted = useRef(false);

  useLocaleSync({ enabled: isAuthenticated && isUserSynced });

  useEffect(() => {
    if (isAuthenticated) {
      setTokenGetter(() => getAccessTokenSilently());
      setTokenRefresher(() => getAccessTokenSilently({ cacheMode: 'off' }));
      setLogout(() => logout({ logoutParams: { returnTo: window.location.origin } }));
    }
    return () => {
      setTokenGetter(null);
      setTokenRefresher(null);
      setLogout(null);
    };
  }, [isAuthenticated, getAccessTokenSilently, logout]);

  useEffect(() => {
    if (!isAuthenticated || syncAttempted.current) return;
    syncAttempted.current = true;

    getIdTokenClaims().then((claims) => {
      if (!claims) {
        setIsUserSynced(true);
        return;
      }
      api
        .put('api/v1/users', { json: { idToken: claims.__raw } })
        .then(() => setIsUserSynced(true))
        .catch(() => setIsUserSynced(true));
    });
  }, [isAuthenticated, getIdTokenClaims]);

  if (isScreenshotMode) return <>{children}</>;

  if (isLoading || (isAuthenticated && !isUserSynced)) {
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
