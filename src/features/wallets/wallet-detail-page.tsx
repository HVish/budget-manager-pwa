import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/api/hooks/use-wallets';
import { useTransactions } from '@/api/hooks/use-transactions';
import { useMonthStore, useMonthRange } from '@/stores/month-store';
import { formatCurrency } from '@/lib/currency';
import { formatMonthYear } from '@/lib/date';
import { walletTypeConfig, getWalletSubtitle } from '@/lib/wallet-types';
import { getCategoryMeta } from '@/lib/categories';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { BalanceHistoryChart } from './balance-history-chart';
import { DeleteWalletDialog } from './delete-wallet-dialog';
import type { Transaction } from '@/api/types';

// ---------------------------------------------------------------------------
// DateGroupedTransactions — groups transactions by date, shows daily totals
// ---------------------------------------------------------------------------

interface DateGroup {
  date: string; // ISO date string
  label: string; // Formatted display: "DEC 31, 2025"
  total: number; // Sum of all amounts for this day (minor units)
  transactions: Transaction[];
}

function groupTransactionsByDate(transactions: Transaction[]): DateGroup[] {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const dateKey = tx.transactionDate.slice(0, 10);
    const existing = groups.get(dateKey) ?? [];
    existing.push(tx);
    groups.set(dateKey, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([dateKey, txs]) => ({
      date: dateKey,
      label: format(parseISO(dateKey), 'MMM d, yyyy').toUpperCase(),
      total: txs.reduce((sum, tx) => sum + tx.amount, 0),
      transactions: txs,
    }));
}

// ---------------------------------------------------------------------------
// WalletDetailPage
// ---------------------------------------------------------------------------

export default function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppNavigate();
  const { year, month } = useMonthStore();
  const { startDate, endDate } = useMonthRange();
  const { data: wallet, isLoading, isError } = useWallet(id ?? '');

  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch transactions for this wallet in the selected month
  const txQuery = useTransactions({
    walletIds: id ? [id] : [],
    startDate,
    endDate,
    limit: 50,
  });

  const allTransactions = useMemo(
    () => txQuery.data?.pages.flatMap((p) => p.transactions) ?? [],
    [txQuery.data],
  );

  const dateGroups = useMemo(() => groupTransactionsByDate(allTransactions), [allTransactions]);

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-[max(env(safe-area-inset-top),16px)]">
        <div className="flex items-center gap-2 pt-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full rounded-xl" />
        <div className="flex flex-col items-center gap-2 py-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-44" />
        </div>
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !wallet) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
        <p className="text-destructive text-sm">Wallet not found</p>
        <Button variant="link" onClick={() => navigate('/wallets')}>
          Back to wallets
        </Button>
      </div>
    );
  }

  const config = walletTypeConfig[wallet.walletType] ?? walletTypeConfig.checking;
  const WalletIcon = config.icon;
  const subtitle = getWalletSubtitle(wallet);
  const isNegative = wallet.balance < 0;
  const monthLabel = formatMonthYear(year, month);

  return (
    <>
      <div className="pb-24">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),16px)]">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground min-h-11 min-w-11 p-2"
            onClick={() => navigate('/wallets')}
            aria-label="Back to wallets"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-foreground flex-1 text-2xl font-bold">Wallet Details</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground min-h-11 min-w-11 p-2"
            onClick={() => navigate(`/wallets/${id}/edit`)}
            aria-label="Edit wallet"
          >
            <Pencil className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 p-2"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete wallet"
          >
            <Trash2 className="text-destructive h-6 w-6" />
          </Button>
        </div>

        {/* Info banner — "Viewing data for" */}
        <div className="px-4 pt-3">
          <div className="bg-card ring-foreground/10 flex items-center gap-2 rounded-xl px-3 py-2 ring-1">
            <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
            <p className="text-muted-foreground text-xs">
              Viewing data for <span className="text-foreground font-medium">{monthLabel}</span>
            </p>
          </div>
        </div>

        {/* Wallet hero — centered icon, name, subtitle, balance */}
        <div className="flex flex-col items-center px-4 pt-6 pb-4">
          <div
            className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', config.iconBg)}
          >
            <WalletIcon className={cn('h-8 w-8', config.iconColor)} />
          </div>
          <h1 className="text-foreground mt-3 text-xl font-bold">{wallet.name}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
          <p className="text-muted-foreground mt-1 text-xs">{config.balanceLabel}</p>
          <p
            className={cn(
              'mt-1 text-3xl font-bold tracking-tight',
              isNegative ? 'text-expense' : 'text-foreground',
            )}
          >
            {formatCurrency(wallet.balance, wallet.currency)}
          </p>
        </div>

        {/* Balance trend chart */}
        <BalanceHistoryChart walletId={wallet.id} currency={wallet.currency} />

        {/* Transactions section */}
        <div className="px-4 pt-6">
          <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
            Transactions
          </h2>

          {txQuery.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          )}

          {!txQuery.isLoading && dateGroups.length === 0 && (
            <div className="bg-card ring-foreground/10 rounded-xl py-8 text-center ring-1">
              <p className="text-muted-foreground text-sm">No transactions this month</p>
            </div>
          )}

          {dateGroups.map((group) => (
            <div key={group.date} className="mb-4">
              {/* Date header with daily total */}
              <div className="mb-2 flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">{group.label}</p>
                <p className="text-muted-foreground text-xs font-medium">
                  {formatCurrency(group.total, wallet.currency)}
                </p>
              </div>

              {/* Transaction rows */}
              <div className="space-y-2">
                {group.transactions.map((tx) => {
                  const meta = getCategoryMeta(tx.category);
                  const Icon = meta.icon;
                  const isIncome = tx.amount > 0;
                  const time = format(parseISO(tx.transactionDate), 'h:mm a');
                  const displayAmount = formatCurrency(Math.abs(tx.amount), tx.currency);

                  return (
                    <div
                      key={tx.id}
                      className="bg-card ring-foreground/10 flex items-center gap-3 rounded-xl p-3 ring-1"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white',
                          meta.color,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">{tx.title}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {meta.label} · {wallet.name}
                        </p>
                      </div>
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
            </div>
          ))}

          {/* Load more */}
          {txQuery.hasNextPage && (
            <div className="pt-2 pb-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => txQuery.fetchNextPage()}
                disabled={txQuery.isFetchingNextPage}
              >
                {txQuery.isFetchingNextPage ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <DeleteWalletDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        walletId={wallet.id}
        walletName={wallet.name}
      />
    </>
  );
}
