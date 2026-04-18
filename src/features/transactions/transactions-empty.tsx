import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppNavigate } from '@/lib/navigation';

interface TransactionsEmptyProps {
  filterLabel?: string; // e.g. "income" or "expense" — undefined for "all"
  isSearching?: boolean;
}

export function TransactionsEmpty({ filterLabel, isSearching }: TransactionsEmptyProps) {
  const navigate = useAppNavigate();

  const message = isSearching
    ? 'No transactions match your search'
    : `No ${filterLabel ? filterLabel + ' ' : ''}transactions this month`;

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20 text-center">
      <ArrowLeftRight className="text-muted-foreground size-12" />
      <p className="text-muted-foreground text-sm">{message}</p>
      {!isSearching && (
        <Button className="min-h-11 rounded-xl px-6" onClick={() => navigate('/transactions/new')}>
          Add Transaction
        </Button>
      )}
    </div>
  );
}
