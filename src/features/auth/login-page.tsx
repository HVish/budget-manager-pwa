import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-background px-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Wallet className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Budget Manager</h1>
        <p className="text-sm text-muted-foreground text-center">
          Track your expenses, wallets, and budgets
        </p>
      </div>
      <Button size="lg" onClick={() => loginWithRedirect()}>
        Sign in to continue
      </Button>
    </div>
  );
}
