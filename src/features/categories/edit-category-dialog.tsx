import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateCategory } from '@/api/hooks/use-categories';
import type { Category } from '@/api/types';

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog({ category, open, onOpenChange }: EditCategoryDialogProps) {
  const [displayName, setDisplayName] = useState(category.displayName);
  const updateCategory = useUpdateCategory(category.id);

  const hasChanges = displayName.trim() !== category.displayName;
  const isValid = displayName.trim().length > 0;

  async function handleSave() {
    if (!hasChanges || !isValid) return;
    try {
      await updateCategory.mutateAsync({ displayName: displayName.trim() });
      onOpenChange(false);
      toast.success('Category updated');
    } catch {
      toast.error('Failed to update category');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogDescription>
          Update the display name for &ldquo;{category.displayName}&rdquo;.
        </DialogDescription>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Category name"
          maxLength={100}
          className="h-11 rounded-lg text-sm"
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!hasChanges || !isValid || updateCategory.isPending}
            onClick={handleSave}
          >
            {updateCategory.isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
