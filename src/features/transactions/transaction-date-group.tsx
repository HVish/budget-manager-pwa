import { format, parseISO } from 'date-fns';
import { formatCurrencyCompact } from '@/lib/currency';
import type { CategoryMeta } from '@/lib/categories';
import type { Transaction } from '@/api/types';
import { TransactionRow } from './transaction-row';

interface TransactionDateGroupProps {
  date: string; // ISO date string (date portion only, e.g. "2025-12-31")
  transactions: Transaction[];
  dailyNet: number; // sum of amounts for this date
  currency: string | null; // null if mixed currencies
  walletMap: Record<string, string>;
  categoryMetaMap?: Record<string, CategoryMeta>;
}

export function TransactionDateGroup({
  date,
  transactions,
  dailyNet,
  currency,
  walletMap,
  categoryMetaMap,
}: TransactionDateGroupProps) {
  const formattedDate = format(parseISO(date), 'MMM d, yyyy');

  return (
    <section aria-label={`Transactions on ${formattedDate}`} className="space-y-3.5">
      {/* Date header row */}
      <div className="flex items-center justify-between px-1 pt-1 pb-1.5">
        <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {formattedDate}
        </h2>
        {currency !== null && (
          <span className="text-muted-foreground text-xs font-medium">
            {dailyNet >= 0 ? '+' : '-'}
            {formatCurrencyCompact(Math.abs(dailyNet), currency)}
          </span>
        )}
      </div>

      {/* Transaction rows */}
      {transactions.map((tx) => (
        <TransactionRow
          key={tx.id}
          transaction={tx}
          walletName={walletMap[tx.walletId] ?? ''}
          categoryMetaMap={categoryMetaMap}
        />
      ))}
    </section>
  );
}
