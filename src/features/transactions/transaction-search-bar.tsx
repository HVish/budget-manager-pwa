import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasActiveFilters: boolean;
  onFilterPress: () => void;
}

export function TransactionSearchBar({
  searchQuery,
  onSearchChange,
  hasActiveFilters,
  onFilterPress,
}: TransactionSearchBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 pb-3">
      <div className="bg-secondary flex min-h-11 flex-1 items-center gap-2 rounded-full px-4">
        <Search className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          maxLength={100}
          enterKeyHint="search"
          placeholder="Search transactions"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          aria-label="Search transactions"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="text-muted-foreground -mr-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onFilterPress}
        aria-label={hasActiveFilters ? 'Filters active, open filters' : 'Open filters'}
        className={cn(
          'bg-secondary relative flex size-11 shrink-0 items-center justify-center rounded-full',
          'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'active:translate-y-px transition-transform duration-100',
        )}
      >
        <SlidersHorizontal className="size-5" aria-hidden="true" />
        {hasActiveFilters && (
          <span className="bg-primary absolute top-1.5 right-1.5 size-2 rounded-full" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
