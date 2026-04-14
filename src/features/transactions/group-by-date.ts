import type { Transaction } from '@/api/types';

export interface DateGroup {
  date: string;
  transactions: Transaction[];
  dailyNet: number;
  currency: string | null; // null if mixed currencies
}

/**
 * Groups transactions by date (newest first) and computes daily net totals.
 * When a single currency is known upfront (e.g. wallet detail), pass it to
 * skip per-group currency detection.
 */
export function groupTransactionsByDate(
  transactions: Transaction[],
  knownCurrency?: string,
): DateGroup[] {
  const groups = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const dateKey = tx.transactionDate.slice(0, 10);
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(dateKey, [tx]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([date, txs]) => {
      if (knownCurrency) {
        return {
          date,
          transactions: txs,
          dailyNet: txs.reduce((sum, t) => sum + t.amount, 0),
          currency: knownCurrency,
        };
      }

      const currencies = new Set(txs.map((t) => t.currency));
      const singleCurrency = currencies.size === 1 ? txs[0].currency : null;
      const dailyNet = singleCurrency ? txs.reduce((sum, t) => sum + t.amount, 0) : 0;

      return { date, transactions: txs, dailyNet, currency: singleCurrency };
    });
}
