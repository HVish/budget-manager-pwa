import { PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppNavigate } from '@/lib/navigation';

export function BudgetEmpty() {
  const navigate = useAppNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20 text-center">
      <PiggyBank className="text-muted-foreground h-12 w-12" />
      <div>
        <p className="text-foreground text-base font-semibold">No budgets yet</p>
        <p className="text-muted-foreground mt-1 max-w-60 text-sm">
          Set spending limits by category to track your budget.
        </p>
      </div>
      <Button
        className="h-14 rounded-xl text-base font-bold"
        onClick={() => navigate('/budgets/new')}
      >
        Create Your First Budget
      </Button>
    </div>
  );
}
