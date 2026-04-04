import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="bg-background flex h-dvh flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-2xl">
          <Wallet className="text-primary-foreground h-8 w-8" />
        </div>
        <h1 className="text-foreground text-2xl font-bold">Budget Manager</h1>
        <p className="text-muted-foreground text-center text-sm">
          Track your expenses, wallets, and budgets
        </p>
      </div>
      <Button size="lg" onClick={() => loginWithRedirect()}>
        Sign in to continue
      </Button>
    </div>
  );
}
