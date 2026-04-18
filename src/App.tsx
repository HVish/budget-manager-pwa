import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'sonner';
import AppRoutes from '@/routes';
import { useIsDesktop } from '@/hooks/use-breakpoint';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: (count, error) => {
        // Don't retry 401s — ky's afterResponse hook handles token refresh
        if (error instanceof HTTPError && error.response.status === 401) return false;
        return count < 1;
      },
    },
  },
});

function ResponsiveToaster() {
  const isDesktop = useIsDesktop();
  return (
    <Toaster
      theme="system"
      position={isDesktop ? 'bottom-right' : 'bottom-center'}
      offset={isDesktop ? 24 : 96}
      toastOptions={{ className: 'bg-card text-foreground ring-1 ring-foreground/10' }}
    />
  );
}

export default function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/callback`,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      useRefreshTokens
      cacheLocation="localstorage"
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          <ResponsiveToaster />
        </BrowserRouter>
      </QueryClientProvider>
    </Auth0Provider>
  );
}
