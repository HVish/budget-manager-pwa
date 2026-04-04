import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWallet, useDeleteWallet } from '@/api/hooks/use-wallets';
import { formatCurrency } from '@/lib/currency';
import { BalanceHistoryChart } from './balance-history-chart';
import { WalletForm } from './wallet-form';

export default function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: wallet, isLoading, isError } = useWallet(id!);
  const deleteWallet = useDeleteWallet();

  const [editOpen, setEditOpen] = useState(false);
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

  async function handleDelete() {
    await deleteWallet.mutateAsync(id!);
    navigate('/wallets', { replace: true });
  }

  return (
    <>
      <div className="space-y-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-2 px-4">
          <Link to="/wallets" className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h2 className="flex-1 text-lg font-semibold">{wallet.name}</h2>
          <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="text-destructive h-4 w-4" />
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

      {/* Edit sheet */}
      <WalletForm open={editOpen} onOpenChange={setEditOpen} wallet={wallet} />

      {/* Delete confirmation */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleteWallet.isPending) setDeleteOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete wallet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{wallet.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteWallet.isPending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteWallet.isPending}>
              {deleteWallet.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
