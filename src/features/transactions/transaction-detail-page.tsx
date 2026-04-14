import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { format } from 'date-fns';
import { Pencil, Trash2, Wallet, CalendarDays, Tag, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { useTransaction } from '@/api/hooks/use-transactions';
import { useWallet } from '@/api/hooks/use-wallets';
import { useCategories } from '@/api/hooks/use-categories';
import { formatCurrency } from '@/lib/currency';
import { buildCategoryMetaMap, getCategoryMeta } from '@/lib/categories';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { DeleteTransactionDialog } from './delete-transaction-dialog';

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-xl">
        <Icon className="text-primary size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <div className="text-foreground mt-0.5 text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TransactionDetailPage
// ---------------------------------------------------------------------------

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppNavigate();
  const { data: transaction, isLoading, isError } = useTransaction(id ?? '');
  const { data: wallet } = useWallet(transaction?.walletId ?? '');

  const [deleteOpen, setDeleteOpen] = useState(false);

  const categoriesQuery = useCategories();
  const categoryMetaMap = useMemo(
    () => buildCategoryMetaMap(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  // ── Loading skeleton ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),24px)]">
        <div className="flex items-center gap-2 pt-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <div className="flex flex-col items-center gap-2 py-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────

  if (isError || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-[max(calc(env(safe-area-inset-top)+80px),96px)] text-center">
        <p className="text-destructive text-sm">Transaction not found</p>
        <Button variant="link" className="min-h-11" onClick={() => navigate('/transactions')}>
          Back to transactions
        </Button>
      </div>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────

  const meta = categoryMetaMap[transaction.category] ?? getCategoryMeta(transaction.category);
  const CategoryIcon = meta.icon;
  const isIncome = transaction.amount > 0;
  const isTransfer = !!transaction.transferId;
  const displayAmount = formatCurrency(Math.abs(transaction.amount), transaction.currency);
  const walletName = wallet?.name ?? '...';
  const subtitle = isTransfer
    ? ['Transfer', walletName].join(' \u00b7 ')
    : [meta.label, walletName].filter(Boolean).join(' \u00b7 ');
  const formattedDate = format(new Date(transaction.transactionDate), 'EEEE, MMMM d, yyyy');
  const createdAt = format(new Date(transaction.createdAt), 'MMM d, yyyy \u00b7 h:mm a');

  const typeBadge = isTransfer
    ? { label: 'Transfer', className: 'bg-indigo-500/15 text-indigo-400' }
    : isIncome
      ? { label: 'Income', className: 'bg-income/15 text-income' }
      : { label: 'Expense', className: 'bg-expense/15 text-expense' };

  return (
    <>
      <div className="pb-[max(env(safe-area-inset-bottom),24px)]">
        {/* Header */}
        <PageHeaderBar title="Transaction" onBack={() => navigate('/transactions')}>
          {!isTransfer && (
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              onClick={() => navigate(`/transactions/${id}/edit`)}
              aria-label="Edit transaction"
            >
              <Pencil />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive min-h-11 min-w-11"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete transaction"
          >
            <Trash2 />
          </Button>
        </PageHeaderBar>

        {/* Hero — mirrors wallet detail: centered icon, title, subtitle, amount */}
        <div className="flex flex-col items-center px-4 pt-6 pb-4">
          <div
            className={cn(
              'flex size-16 items-center justify-center rounded-2xl text-white',
              meta.color,
            )}
          >
            <CategoryIcon className="size-8" />
          </div>
          <h2 className="text-foreground mt-3 text-xl font-bold">{transaction.title}</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
          <span
            className={cn(
              'mt-2 inline-flex rounded-full px-3 py-0.5 text-xs font-medium',
              typeBadge.className,
            )}
          >
            {typeBadge.label}
          </span>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight',
              isIncome ? 'text-income' : 'text-foreground',
            )}
          >
            {isIncome ? '' : '-'}
            {displayAmount}
          </p>
        </div>

        {/* Detail rows */}
        <div className="px-4 pt-2">
          <Card className="gap-0 py-0">
            <CardContent className="p-0">
              <DetailRow icon={Wallet} label="Wallet">
                {walletName}
              </DetailRow>

              <Separator />

              <DetailRow icon={CalendarDays} label="Date">
                {formattedDate}
              </DetailRow>

              {transaction.notes && (
                <>
                  <Separator />
                  <DetailRow icon={FileText} label="Notes">
                    <p className="whitespace-pre-wrap">{transaction.notes}</p>
                  </DetailRow>
                </>
              )}

              {transaction.tags && transaction.tags.length > 0 && (
                <>
                  <Separator />
                  <DetailRow icon={Tag} label="Tags">
                    <div className="flex flex-wrap gap-1.5">
                      {transaction.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </DetailRow>
                </>
              )}

              <Separator />

              <DetailRow icon={Clock} label="Created">
                {createdAt}
              </DetailRow>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transactionId={transaction.id}
        transactionTitle={transaction.title}
      />
    </>
  );
}
