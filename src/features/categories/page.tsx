import { useState, useMemo } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { useCategories, useDeleteCategory } from '@/api/hooks/use-categories';
import { getCategoryMeta } from '@/lib/categories';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/api/types';
import { EditCategoryDialog } from './edit-category-dialog';

export default function CategoriesPage() {
  const navigate = useAppNavigate();
  const categoriesQuery = useCategories({ sort: 'name' });
  const deleteCategory = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { defaultIncome, defaultExpense, custom } = useMemo(() => {
    const defaultIncome: Category[] = [];
    const defaultExpense: Category[] = [];
    const custom: Category[] = [];

    for (const cat of categoriesQuery.data ?? []) {
      if (cat.isSystem) continue;
      if (cat.source === 'custom') {
        custom.push(cat);
      } else if (cat.type === 'income') {
        defaultIncome.push(cat);
      } else {
        defaultExpense.push(cat);
      }
    }
    return { defaultIncome, defaultExpense, custom };
  }, [categoriesQuery.data]);

  async function handleDelete() {
    if (!deletingCategory) return;
    try {
      await deleteCategory.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  }

  return (
    <div className="pb-[max(env(safe-area-inset-bottom),24px)]">
      <PageHeaderBar title="Categories" onBack={() => navigate(-1)} />

      {categoriesQuery.isError ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
          <p className="text-destructive text-sm">Failed to load categories</p>
          <Button variant="link" onClick={() => categoriesQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : categoriesQuery.isLoading ? (
        <div className="space-y-6 px-4 pt-4">
          <div>
            <Skeleton className="mb-2 ml-1 h-3 w-24" />
            <Card className="py-0">
              <CardContent className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Skeleton className="mb-2 ml-1 h-3 w-32" />
            <Card className="py-0">
              <CardContent className="space-y-2 p-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <main className="space-y-6 px-4 pt-4">
          {/* Default Income */}
          <section>
            <h2 className="text-primary mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
              Income
            </h2>
            <Card className="gap-0 py-0">
              <CardContent className="p-0">
                {defaultIncome.map((cat, i) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    isLast={i === defaultIncome.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Default Expense */}
          <section>
            <h2 className="text-primary mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
              Expense
            </h2>
            <Card className="gap-0 py-0">
              <CardContent className="p-0">
                {defaultExpense.map((cat, i) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    isLast={i === defaultExpense.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Custom Categories */}
          <section>
            <h2 className="text-primary mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
              My Categories
            </h2>
            {custom.length === 0 ? (
              <Card className="py-0">
                <CardContent className="px-4 py-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    No custom categories yet. Create one below.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="gap-0 py-0">
                <CardContent className="p-0">
                  {custom.map((cat, i) => (
                    <div key={cat.id}>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <CategoryIcon category={cat} />
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-sm font-medium">
                            {cat.displayName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {cat.type === 'income' ? 'Income' : 'Expense'}
                            {cat.usageCount > 0 && ` \u00b7 Used ${cat.usageCount} times`}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-3"
                          aria-label={`Edit ${cat.displayName}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="focus-visible:ring-ring/50 text-muted-foreground hover:text-destructive flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-3"
                          aria-label={`Delete ${cat.displayName}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      {i < custom.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button
              variant="outline"
              className="mt-3 h-11 w-full rounded-lg text-sm font-medium"
              onClick={() => navigate('/categories/new')}
            >
              <Plus className="mr-2 size-4" />
              Add Category
            </Button>
          </section>
        </main>
      )}

      {/* Edit dialog */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => {
            if (!open) setEditingCategory(null);
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Delete &ldquo;{deletingCategory?.displayName}&rdquo;? Existing transactions will keep
            this category but you won&rsquo;t be able to use it for new transactions.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteCategory.isPending}
              onClick={handleDelete}
            >
              {deleteCategory.isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: Category }) {
  const meta = getCategoryMeta(category.name, category);
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
        meta.color,
      )}
    >
      <Icon className="size-4" />
    </div>
  );
}

function CategoryRow({ category, isLast }: { category: Category; isLast: boolean }) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3">
        <CategoryIcon category={category} />
        <span className="text-foreground flex-1 text-sm font-medium">{category.displayName}</span>
      </div>
      {!isLast && <Separator />}
    </>
  );
}
