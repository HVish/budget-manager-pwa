import { useState, useMemo } from 'react';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SheetClose, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ResponsiveSheet } from '@/components/ui/responsive-sheet';
import { useCategories, useCategorySearch, useCreateCategory } from '@/api/hooks/use-categories';
import { useVisualViewportHeight } from '@/hooks/use-visual-viewport-height';
import { useIsDesktop } from '@/hooks/use-breakpoint';
import { getCategoryMeta } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { Category, CategoryType } from '@/api/types';

interface CategoryPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: CategoryType;
  value?: string;
  onChange: (categoryName: string) => void;
  allowCreate?: boolean;
}

export function CategoryPickerSheet({
  open,
  onOpenChange,
  type,
  value,
  onChange,
  allowCreate = true,
}: CategoryPickerSheetProps) {
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  const isDesktop = useIsDesktop();
  const vpHeight = useVisualViewportHeight(open && !isDesktop);
  const sheetHeight = isDesktop ? undefined : Math.round(vpHeight * 0.7);

  // Fetch all categories sorted by relevance (for initial/empty search state)
  const categoriesQuery = useCategories({ type, sort: 'relevance' });

  // Search query (only fires when search has content)
  const searchQuery = useCategorySearch({ q: search.trim(), type });

  const createCategory = useCreateCategory();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSearch('');
      setShowCreateForm(false);
      setNewDisplayName('');
    }
    onOpenChange(next);
  }

  // Use search results when searching, otherwise use full list
  const isSearching = search.trim().length > 0;

  // Filter out system categories
  const filtered = useMemo(() => {
    const list = isSearching ? (searchQuery.data ?? []) : (categoriesQuery.data ?? []);
    return list.filter((cat) => !cat.isSystem);
  }, [isSearching, searchQuery.data, categoriesQuery.data]);

  const isLoading = isSearching ? searchQuery.isLoading : categoriesQuery.isLoading;

  const hasExactMatch = useMemo(
    () => filtered.some((cat) => cat.displayName.toLowerCase() === search.trim().toLowerCase()),
    [filtered, search],
  );

  function handleSelect(cat: Category) {
    onChange(cat.name);
    handleOpenChange(false);
  }

  async function handleCreateWithName(displayName: string) {
    if (!displayName || !type) return;

    try {
      const created = await createCategory.mutateAsync({ displayName, type });
      onChange(created.name);
      handleOpenChange(false);
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response: Response }).response;
        if (resp.status === 409) {
          toast.error('A category with this name already exists');
          return;
        }
      }
      toast.error('Failed to create category');
    }
  }

  function handleCreate() {
    handleCreateWithName(newDisplayName.trim());
  }

  function handleQuickCreate() {
    handleCreateWithName(search.trim());
  }

  return (
    <ResponsiveSheet open={open} onOpenChange={handleOpenChange} title="Select Category">
      <div
        style={sheetHeight ? { height: sheetHeight } : undefined}
        className="flex flex-col gap-0"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <SheetTitle className="text-base font-semibold">Select Category</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a category for your transaction
          </SheetDescription>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="min-h-11 min-w-11"
                aria-label="Close"
              />
            }
          >
            <X className="h-4 w-4" />
          </SheetClose>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
              className="h-11 rounded-lg pl-9 text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Category list */}
        <div className="flex-1 overflow-y-auto p-2 pb-[env(safe-area-inset-bottom)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          ) : filtered.length === 0 && !isSearching ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No categories found</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((cat) => {
                const meta = getCategoryMeta(cat.name, cat);
                const Icon = meta.icon;
                const isSelected = value === cat.name;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={cn(
                      'focus-visible:ring-ring/50 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors outline-none focus-visible:ring-3 active:scale-[0.98]',
                      isSelected ? 'bg-accent-soft' : 'active:bg-accent/50',
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
                        meta.color,
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span
                      className={cn(
                        'flex-1 text-left text-sm font-medium',
                        isSelected ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {cat.displayName}
                    </span>
                    {cat.source === 'custom' && (
                      <span className="text-muted-foreground text-xs">Custom</span>
                    )}
                  </button>
                );
              })}

              {/* "Create new" option when search has no exact match */}
              {allowCreate && isSearching && !hasExactMatch && !showCreateForm && type && (
                <button
                  onClick={handleQuickCreate}
                  disabled={createCategory.isPending}
                  className="focus-visible:ring-ring/50 active:bg-accent/50 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors outline-none focus-visible:ring-3 active:scale-[0.98]"
                >
                  <div className="bg-primary/15 flex size-8 shrink-0 items-center justify-center rounded-full">
                    {createCategory.isPending ? (
                      <Loader2 className="text-primary size-4 animate-spin" />
                    ) : (
                      <Plus className="text-primary size-4" />
                    )}
                  </div>
                  <span className="text-primary flex-1 text-left text-sm font-medium">
                    Create &ldquo;{search.trim()}&rdquo;
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Inline create form (when search is empty) */}
          {allowCreate && !isSearching && type && (
            <>
              <Separator className="my-2" />
              {showCreateForm ? (
                <div className="space-y-3 px-1 py-2">
                  <Input
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Category name"
                    maxLength={100}
                    className="h-11 rounded-lg text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 flex-1"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewDisplayName('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="min-h-11 flex-1"
                      disabled={!newDisplayName.trim() || createCategory.isPending}
                      onClick={handleCreate}
                    >
                      {createCategory.isPending ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      ) : null}
                      Create
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="focus-visible:ring-ring/50 active:bg-accent/50 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors outline-none focus-visible:ring-3 active:scale-[0.98]"
                >
                  <div className="bg-primary/15 flex size-8 shrink-0 items-center justify-center rounded-full">
                    <Plus className="text-primary size-4" />
                  </div>
                  <span className="text-primary text-sm font-medium">Create new category</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </ResponsiveSheet>
  );
}
