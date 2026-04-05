import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteBudget } from '@/api/hooks/use-budgets';

interface DeleteBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string;
  categoryLabel: string;
  onDeleted?: () => void;
}

export function DeleteBudgetDialog({
  open,
  onOpenChange,
  budgetId,
  categoryLabel,
  onDeleted,
}: DeleteBudgetDialogProps) {
  const deleteBudget = useDeleteBudget();

  // Reset mutation state when dialog reopens so stale errors don't persist
  const handleOpenChange = (isOpen: boolean) => {
    if (!deleteBudget.isPending) {
      if (isOpen) deleteBudget.reset();
      onOpenChange(isOpen);
    }
  };

  async function handleDelete() {
    try {
      await deleteBudget.mutateAsync(budgetId);
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // Error is shown inline; keep dialog open for retry
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete budget</DialogTitle>
          <DialogDescription>
            Delete budget for {categoryLabel}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteBudget.isError && (
          <p role="alert" className="text-destructive text-sm">
            Failed to delete budget. Please try again.
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => handleOpenChange(false)}
            disabled={deleteBudget.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="min-h-11"
            onClick={handleDelete}
            disabled={deleteBudget.isPending}
          >
            {deleteBudget.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
