import { format, parseISO } from 'date-fns';
import { AppLink } from '@/components/ui/app-link';
import { formatCurrency } from '@/lib/currency';
import { getCategoryMeta } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { DashboardTransaction } from '@/api/types';

interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
  walletMap: Record<string, string>;
}

export function RecentTransactions({ transactions, walletMap }: RecentTransactionsProps) {
  return (
    <div className="pt-2">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-base font-semibold">Recent Transactions</h2>
        <AppLink
          to="/transactions"
          className="text-primary inline-flex min-h-11 items-center text-xs font-medium hover:underline"
        >
          View All
        </AppLink>
      </div>

      {/* Empty state */}
      {!transactions.length ? (
        <div className="bg-card ring-foreground/10 rounded-xl p-8 text-center ring-1">
          <p className="text-muted-foreground text-sm">No transactions this month</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.map((tx) => {
            const meta = getCategoryMeta(tx.category);
            const Icon = meta.icon;
            const isIncome = tx.amount > 0;
            const walletName = walletMap[tx.walletId] ?? '';
            const subtitle = [meta.label, walletName].filter(Boolean).join(' · ');
            const time = format(parseISO(tx.transactionDate), 'h:mm a');
            const displayAmount = formatCurrency(Math.abs(tx.amount), tx.currency);

            return (
              // TODO: Make rows tappable when transaction detail page is implemented
              <div
                key={tx.id}
                className="bg-card ring-foreground/10 flex items-center gap-3 rounded-xl p-3 ring-1"
              >
                {/* Category icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white',
                    meta.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Title + subtitle */}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">{tx.title}</p>
                  <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
                </div>

                {/* Amount + time */}
                <div className="flex shrink-0 flex-col items-end">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isIncome ? 'text-income' : 'text-foreground',
                    )}
                  >
                    {isIncome ? '+' : '-'}
                    {displayAmount}
                  </span>
                  <span className="text-muted-foreground text-xs">{time}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
