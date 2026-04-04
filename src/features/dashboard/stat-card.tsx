import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { Currency } from '@/api/types';

interface StatCardProps {
  type: 'income' | 'spent';
  amount: number;
  currency: Currency;
  conversionAvailable?: boolean;
}

export function StatCard({ type, amount, currency, conversionAvailable = true }: StatCardProps) {
  const isIncome = type === 'income';
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  const label = isIncome ? 'Income' : 'Spent';

  return (
    <Card>
      <CardContent className="p-4">
        {/* Icon circle */}
        <div className="bg-accent-soft flex h-9 w-9 items-center justify-center rounded-full">
          <Icon className="text-accent-soft-foreground h-4 w-4" />
        </div>

        {/* Label */}
        <p className="text-muted-foreground mt-2 text-xs">{label}</p>

        {/* Amount */}
        <p className={cn('mt-0.5 text-lg font-bold', isIncome ? 'text-income' : 'text-foreground')}>
          {conversionAvailable ? formatCurrency(amount, currency) : '—'}
        </p>
      </CardContent>
    </Card>
  );
}
