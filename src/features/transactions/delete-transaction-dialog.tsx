import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteTransaction } from '@/api/hooks/use-transactions';
import { useAppNavigate } from '@/lib/navigation';

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionTitle: string;
}

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  transactionId,
  transactionTitle,
}: DeleteTransactionDialogProps) {
  const navigate = useAppNavigate();
  const deleteTransaction = useDeleteTransaction();

  async function handleDelete() {
    try {
      await deleteTransaction.mutateAsync(transactionId);
      navigate('/transactions', { replace: true });
    } catch {
      // Error is handled by the mutation; keep dialog open for retry
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!deleteTransaction.isPending) onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{transactionTitle}&quot;? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {deleteTransaction.isError && (
          <p className="text-destructive text-sm">
            Failed to delete transaction. Please try again.
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteTransaction.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTransaction.isPending}
          >
            {deleteTransaction.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
