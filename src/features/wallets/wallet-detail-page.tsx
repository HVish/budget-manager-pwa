import { useState } from 'react';
import { useParams } from 'react-router';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/api/hooks/use-wallets';
import { formatCurrency } from '@/lib/currency';
import { useAppNavigate } from '@/lib/navigation';
import { BalanceHistoryChart } from './balance-history-chart';
import { DeleteWalletDialog } from './delete-wallet-dialog';

export default function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppNavigate();
  const { data: wallet, isLoading, isError } = useWallet(id ?? '');

  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !wallet) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
        <p className="text-destructive text-sm">Wallet not found</p>
        <Button variant="link" onClick={() => navigate('/wallets')}>
          Back to wallets
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-2 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/wallets')}
            aria-label="Back to wallets"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="flex-1 text-lg font-semibold">{wallet.name}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/wallets/${id}/edit`)}
            aria-label="Edit wallet"
          >
            <Pencil className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete wallet"
          >
            <Trash2 className="text-destructive h-5 w-5" />
          </Button>
        </div>

        {/* Balance card */}
        <div className="px-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Current Balance</p>
              <p className="text-2xl font-bold">
                {formatCurrency(wallet.balance, wallet.currency)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {wallet.walletType.charAt(0).toUpperCase() + wallet.walletType.slice(1)}
                {wallet.accountNumber && ` · ${wallet.accountNumber}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <BalanceHistoryChart walletId={wallet.id} currency={wallet.currency} />
      </div>

      <DeleteWalletDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        walletId={wallet.id}
        walletName={wallet.name}
      />
    </>
  );
}
