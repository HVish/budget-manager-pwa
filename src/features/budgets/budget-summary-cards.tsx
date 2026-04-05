import { ArrowUpRight, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import type { Currency } from '@/api/types';

interface BudgetSummaryCardsProps {
  totalSpent: number;
  totalLimit: number;
  percentageConsumed: number;
  primaryCurrency: Currency;
}

export function BudgetSummaryCards({
  totalSpent,
  totalLimit,
  percentageConsumed,
  primaryCurrency,
}: BudgetSummaryCardsProps) {
  const pct = Math.round(percentageConsumed);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Spent */}
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="bg-accent-soft flex h-9 w-9 items-center justify-center rounded-full">
            <ArrowUpRight className="text-accent-soft-foreground h-4 w-4" />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">Total Spent</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums">
            {formatCurrency(totalSpent, primaryCurrency)}
          </p>
          <p className="text-muted-foreground text-xs tabular-nums">{pct}% utilized</p>
        </CardContent>
      </Card>

      {/* Monthly Limit */}
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="bg-accent-soft flex h-9 w-9 items-center justify-center rounded-full">
            <Wallet className="text-accent-soft-foreground h-4 w-4" />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">Monthly Limit</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums">
            {formatCurrency(totalLimit, primaryCurrency)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
