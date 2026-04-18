import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallets } from '@/api/hooks/use-wallets';
import { useCategories } from '@/api/hooks/use-categories';
import { getCategoryMeta } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SheetClose, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ResponsiveSheet } from '@/components/ui/responsive-sheet';

export interface TransactionFilterState {
  walletIds: string[];
  category: string | undefined;
}

interface TransactionFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TransactionFilterState;
  onApply: (filters: TransactionFilterState) => void;
}

// Inner component mounts fresh each time the sheet opens, so draft
// is always initialized from the committed filter state without effects.
function FilterSheetBody({
  initialFilters,
  onApply,
  onClose,
}: {
  initialFilters: TransactionFilterState;
  onApply: (filters: TransactionFilterState) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<TransactionFilterState>(initialFilters);

  const walletsQuery = useWallets();
  const categoriesQuery = useCategories({ sort: 'relevance' });

  function toggleWallet(id: string) {
    setDraft((prev) => ({
      ...prev,
      walletIds: prev.walletIds.includes(id)
        ? prev.walletIds.filter((w) => w !== id)
        : [...prev.walletIds, id],
    }));
  }

  function selectCategory(name: string) {
    setDraft((prev) => ({
      ...prev,
      category: prev.category === name ? undefined : name,
    }));
  }

  function handleClear() {
    setDraft({ walletIds: [], category: undefined });
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }

  const wallets = walletsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <>
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 lg:hidden">
        <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-2">
        <SheetTitle className="text-base font-semibold">Filters</SheetTitle>
        <SheetDescription className="sr-only">
          Filter transactions by wallet or category
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

      <Separator />

      {/* Scrollable filter content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {wallets.length > 0 && (
          <div className="mb-4">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Wallet
            </p>
            <div className="flex flex-wrap gap-2">
              {wallets.map((wallet) => {
                const isSelected = draft.walletIds.includes(wallet.id);
                return (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => toggleWallet(wallet.id)}
                    className={cn(
                      'min-h-11 rounded-4xl px-4 py-2 text-sm font-medium transition-colors duration-150',
                      'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {wallet.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const meta = getCategoryMeta(cat.name, cat);
                const Icon = meta.icon;
                const isSelected = draft.category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategory(cat.name)}
                    className={cn(
                      'flex min-h-11 items-center gap-1.5 rounded-4xl px-3 py-2 text-sm font-medium transition-colors duration-150',
                      'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                    {meta.label || cat.displayName}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-3 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),16px)]">
        <Button variant="outline" className="min-h-11 flex-1 rounded-xl" onClick={handleClear}>
          Clear
        </Button>
        <Button className="min-h-11 flex-1 rounded-xl" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </>
  );
}

export function TransactionFilterSheet({
  open,
  onOpenChange,
  filters,
  onApply,
}: TransactionFilterSheetProps) {
  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title="Filter Transactions">
      {open && (
        <FilterSheetBody
          initialFilters={filters}
          onApply={onApply}
          onClose={() => onOpenChange(false)}
        />
      )}
    </ResponsiveSheet>
  );
}
