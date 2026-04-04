import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppNavigate } from '@/lib/navigation';

interface TransactionsEmptyProps {
  filterLabel?: string; // e.g. "income" or "expense" — undefined for "all"
}

export function TransactionsEmpty({ filterLabel }: TransactionsEmptyProps) {
  const navigate = useAppNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20 text-center">
      <ArrowLeftRight className="text-muted-foreground/50 size-12" />
      <p className="text-muted-foreground text-sm">
        No {filterLabel ? filterLabel + ' ' : ''}transactions this month
      </p>
      <Button className="min-h-11 rounded-xl px-6" onClick={() => navigate('/transactions/new')}>
        Add Transaction
      </Button>
    </div>
  );
}
