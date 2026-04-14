import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { getCategoryMeta, type CategoryMeta } from '@/lib/categories';
import type { Currency } from '@/api/types';

/** Minimal transaction shape — works with both Transaction and DashboardTransaction */
export interface TransactionLike {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: Currency;
  walletId: string;
}

interface TransactionRowProps {
  transaction: TransactionLike;
  walletName: string;
  categoryMetaMap?: Record<string, CategoryMeta>;
}

export function TransactionRow({
  transaction: tx,
  walletName,
  categoryMetaMap,
}: TransactionRowProps) {
  const meta = categoryMetaMap?.[tx.category] ?? getCategoryMeta(tx.category);
  const Icon = meta.icon;
  const isIncome = tx.amount > 0;
  const subtitle = [meta.label, walletName].filter(Boolean).join(' \u00b7 ');
  const displayAmount = formatCurrency(Math.abs(tx.amount), tx.currency);

  return (
    // TODO: Make rows tappable when transaction detail page is implemented
    <div className="bg-card ring-foreground/10 flex cursor-pointer items-center gap-3 rounded-2xl p-3 ring-1 transition-transform active:scale-[0.98]">
      {/* Category icon */}
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full text-white',
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

      {/* Amount */}
      <span
        className={cn(
          'shrink-0 text-sm font-semibold',
          isIncome ? 'text-income' : 'text-foreground',
        )}
      >
        {isIncome ? '+' : '-'}
        {displayAmount}
      </span>
    </div>
  );
}
