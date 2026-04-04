import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteWallet } from '@/api/hooks/use-wallets';
import { useAppNavigate } from '@/lib/navigation';

interface DeleteWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletId: string;
  walletName: string;
}

export function DeleteWalletDialog({
  open,
  onOpenChange,
  walletId,
  walletName,
}: DeleteWalletDialogProps) {
  const navigate = useAppNavigate();
  const deleteWallet = useDeleteWallet();

  async function handleDelete() {
    try {
      await deleteWallet.mutateAsync(walletId);
      navigate('/wallets', { replace: true });
    } catch {
      // Error is handled by the mutation; keep dialog open for retry
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!deleteWallet.isPending) onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete wallet</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{walletName}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteWallet.isError && (
          <p className="text-destructive text-sm">Failed to delete wallet. Please try again.</p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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
  );
}
