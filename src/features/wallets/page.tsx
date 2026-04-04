import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallets } from "@/api/hooks/use-wallets";
import { WalletCard } from "./wallet-card";
import { WalletForm } from "./wallet-form";

export default function WalletsPage() {
  const { data: wallets, isLoading, isError, refetch } = useWallets();
  const [formOpen, setFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
        <p className="text-sm text-destructive">Failed to load wallets</p>
        <Button variant="link" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Wallets</h2>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {!wallets?.length ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No wallets yet. Create one to get started.
          </div>
        ) : (
          wallets.map((w) => <WalletCard key={w.id} wallet={w} />)
        )}
      </div>

      <WalletForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
