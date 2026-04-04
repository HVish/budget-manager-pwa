import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function CallbackPage() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="bg-background flex h-dvh items-center justify-center">
      <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
    </div>
  );
}
