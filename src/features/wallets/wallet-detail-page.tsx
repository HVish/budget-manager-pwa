import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { Pencil, Trash2 } from 'lucide-react';
import { TransactionDateGroup } from '@/features/transactions/transaction-date-group';
import { Button } from '@/components/ui/button';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/api/hooks/use-wallets';
import { useTransactions } from '@/api/hooks/use-transactions';
import { useMonthStore, useMonthRange } from '@/stores/month-store';
import { formatCurrency } from '@/lib/currency';
import { formatMonthYear } from '@/lib/date';
import { walletTypeConfig, getWalletSubtitle } from '@/lib/wallet-types';
import { useCategories } from '@/api/hooks/use-categories';
import { buildCategoryMetaMap } from '@/lib/categories';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { BalanceHistoryChart } from './balance-history-chart';
import { DeleteWalletDialog } from './delete-wallet-dialog';
import { groupTransactionsByDate } from '@/features/transactions/group-by-date';

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

  const dateGroups = useMemo(
    () => groupTransactionsByDate(allTransactions, wallet?.currency),
    [allTransactions, wallet?.currency],
  );

  const walletMap = useMemo(() => (wallet ? { [wallet.id]: wallet.name } : {}), [wallet]);

  const categoriesQuery = useCategories();
  const categoryMetaMap = useMemo(
    () => buildCategoryMetaMap(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

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
        <Button variant="link" className="min-h-11" onClick={() => navigate('/wallets')}>
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
      <div className="pb-[max(env(safe-area-inset-bottom),24px)]">
        {/* Header */}
        <PageHeaderBar title="Wallet Details" onBack={() => navigate('/wallets')}>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            onClick={() => navigate(`/wallets/${id}/edit`)}
            aria-label="Edit wallet"
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive min-h-11 min-w-11"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete wallet"
          >
            <Trash2 />
          </Button>
        </PageHeaderBar>

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
          <h2 className="text-foreground mt-3 text-xl font-bold">{wallet.name}</h2>
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

          <div className="space-y-4">
            {dateGroups.map((group) => (
              <TransactionDateGroup
                key={group.date}
                date={group.date}
                transactions={group.transactions}
                dailyNet={group.dailyNet}
                currency={wallet.currency}
                walletMap={walletMap}
                categoryMetaMap={categoryMetaMap}
              />
            ))}
          </div>

          {/* Load more */}
          {txQuery.hasNextPage && (
            <div className="pt-2 pb-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="min-h-11"
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
