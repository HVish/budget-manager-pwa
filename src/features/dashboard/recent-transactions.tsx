import { AppLink } from '@/components/ui/app-link';
import type { CategoryMeta } from '@/lib/categories';
import type { DashboardTransaction } from '@/api/types';
import { TransactionRow } from '@/features/transactions/transaction-row';

interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
  walletMap: Record<string, string>;
  categoryMetaMap?: Record<string, CategoryMeta>;
}

export function RecentTransactions({
  transactions,
  walletMap,
  categoryMetaMap,
}: RecentTransactionsProps) {
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
        <div className="space-y-4">
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              walletName={walletMap[tx.walletId] ?? ''}
              categoryMetaMap={categoryMetaMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
