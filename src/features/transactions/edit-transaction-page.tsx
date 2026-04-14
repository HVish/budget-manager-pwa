import { useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router';
import { format } from 'date-fns';
import { Calendar, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { FieldLabel } from '@/components/ui/field-label';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { CategoryPickerSheet } from '@/components/category-picker-sheet';
import { useTransaction, useUpdateTransaction } from '@/api/hooks/use-transactions';
import { useCategories } from '@/api/hooks/use-categories';
import { useScrollIntoViewOnFocus } from '@/hooks/use-scroll-into-view-on-focus';
import { formatAmount, parseAmount } from '@/lib/currency';
import { inputClassName } from '@/lib/form-constants';
import { useAppNavigate } from '@/lib/navigation';
import { getCategoryMeta, buildCategoryMetaMap } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { Transaction, TransactionUpdate, CategoryType } from '@/api/types';
import { DeleteTransactionDialog } from './delete-transaction-dialog';

// ---------------------------------------------------------------------------
// Error extraction helper
// ---------------------------------------------------------------------------

async function extractErrorMessage(err: unknown): Promise<string> {
  if (err && typeof err === 'object' && 'response' in err) {
    try {
      const body = await (err as { response: Response }).response.json();
      const reason = body?.['invalid-params']?.[0]?.reason;
      if (typeof reason === 'string') return reason;
    } catch {
      /* ignore parse errors */
    }
  }
  return 'Failed to save changes. Please try again.';
}

// ---------------------------------------------------------------------------
// Inner form — rendered only once transaction is loaded
// ---------------------------------------------------------------------------

interface EditTransactionFormProps {
  transaction: Transaction;
}

function EditTransactionForm({ transaction: tx }: EditTransactionFormProps) {
  const navigate = useAppNavigate();
  const updateTransaction = useUpdateTransaction(tx.id);

  const isIncome = tx.amount > 0;
  const categoryType: CategoryType = isIncome ? 'income' : 'expense';

  const [title, setTitle] = useState(tx.title);
  const [amount, setAmount] = useState(formatAmount(Math.abs(tx.amount)));
  const [category, setCategory] = useState(tx.category);
  const [date, setDate] = useState(tx.transactionDate);
  const [notes, setNotes] = useState(tx.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  useScrollIntoViewOnFocus(formRef);

  // ── Category metadata ───────────────────────────────────────────────────

  const categoriesQuery = useCategories({ type: categoryType, sort: 'relevance' });
  const categoryMetaMap = useMemo(
    () => buildCategoryMetaMap(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );
  const selectedCategoryLabel = category
    ? (categoryMetaMap[category]?.label ?? getCategoryMeta(category).label)
    : '';

  // ── Change detection ────────────────────────────────────────────────────

  const newAmountMinor = parseAmount(amount);
  const signedAmount = isIncome ? newAmountMinor : -newAmountMinor;
  const hasTitleChanged = title.trim() !== tx.title;
  const hasAmountChanged = signedAmount !== tx.amount;
  const hasCategoryChanged = category !== tx.category;
  const hasDateChanged = date !== tx.transactionDate;
  const hasNotesChanged = (notes.trim() || undefined) !== (tx.notes ?? undefined);
  const hasChanges =
    hasTitleChanged || hasAmountChanged || hasCategoryChanged || hasDateChanged || hasNotesChanged;

  // ── Validation ──────────────────────────────────────────────────────────

  const isAmountValid = newAmountMinor > 0;
  const isTitleValid = title.trim().length > 0;
  const isCategoryValid = !!category;
  const isDateValid = !!date;
  const isFormValid = isAmountValid && isTitleValid && isCategoryValid && isDateValid;

  const isPending = updateTransaction.isPending;

  // ── Field change helper ─────────────────────────────────────────────────

  function clearError() {
    setError(null);
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    if (!isFormValid) {
      if (!isTitleValid) toast.error('Please enter a title');
      else if (!isAmountValid) toast.error('Please enter an amount');
      else if (!isCategoryValid) toast.error('Please select a category');
      else if (!isDateValid) toast.error('Please select a date');
      return;
    }

    if (!hasChanges) {
      toast.error('No changes to save');
      return;
    }

    setError(null);

    try {
      const payload: TransactionUpdate = {};
      if (hasTitleChanged) payload.title = title.trim();
      if (hasAmountChanged) payload.amount = signedAmount;
      if (hasCategoryChanged) payload.category = category;
      if (hasDateChanged) payload.transactionDate = date;
      if (hasNotesChanged) payload.notes = notes.trim();

      await updateTransaction.mutateAsync(payload);
      navigate(`/transactions/${tx.id}`);
    } catch (err) {
      const message = await extractErrorMessage(err);
      setError(message);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="bg-background flex h-dvh flex-col">
      <PageHeaderBar title="Edit Transaction" onClose={() => navigate(-1)} />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 space-y-6 overflow-y-auto px-5 pt-8 pb-[max(env(safe-area-inset-bottom),24px)]"
      >
        {/* Title */}
        <div>
          <FieldLabel htmlFor="edit-txn-title">Title</FieldLabel>
          <Input
            id="edit-txn-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError();
            }}
            placeholder="e.g. Weekly groceries"
            maxLength={255}
            className={cn(inputClassName, submitted && !isTitleValid && 'border-destructive')}
          />
          {submitted && !isTitleValid && (
            <p className="text-destructive mt-1 text-sm">Please enter a title</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <FieldLabel htmlFor="edit-txn-amount">Amount</FieldLabel>
          <CurrencyInput
            id="edit-txn-amount"
            value={amount}
            onChange={(v) => {
              setAmount(v);
              clearError();
            }}
            currency={tx.currency}
            allowNegative={false}
            aria-label="Transaction amount"
          />
          {submitted && !isAmountValid && (
            <p className="text-destructive mt-1 text-sm">Please enter an amount</p>
          )}
        </div>

        {/* Category */}
        <div>
          <FieldLabel>Category</FieldLabel>
          <button
            type="button"
            onClick={() => setCategorySheetOpen(true)}
            className={cn(
              'flex w-full items-center gap-3 border transition-colors',
              inputClassName,
              submitted && !category && 'border-destructive',
            )}
          >
            {category ? (
              (() => {
                const meta = categoryMetaMap[category] ?? getCategoryMeta(category);
                const Icon = meta.icon;
                return (
                  <>
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full text-white',
                        meta.color,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-foreground flex-1 text-left font-medium">
                      {selectedCategoryLabel}
                    </span>
                  </>
                );
              })()
            ) : (
              <span className="text-muted-foreground flex-1 text-left">Select category</span>
            )}
            <ChevronRight className="text-muted-foreground size-4 shrink-0" />
          </button>
          {submitted && !category && (
            <p className="text-destructive mt-1 text-sm">Please select a category</p>
          )}
          <CategoryPickerSheet
            open={categorySheetOpen}
            onOpenChange={setCategorySheetOpen}
            type={categoryType}
            value={category}
            onChange={(v) => {
              setCategory(v);
              clearError();
            }}
          />
        </div>

        {/* Date */}
        <div>
          <FieldLabel htmlFor="edit-txn-date">Date</FieldLabel>
          <div className="relative">
            <Input
              id="edit-txn-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                clearError();
              }}
              max={format(new Date(), 'yyyy-MM-dd')}
              className={cn(
                inputClassName,
                'appearance-none pr-10',
                submitted && !isDateValid && 'border-destructive',
              )}
            />
            <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2" />
          </div>
          {submitted && !isDateValid && (
            <p className="text-destructive mt-1 text-sm">Please select a date</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <FieldLabel htmlFor="edit-txn-notes">Notes</FieldLabel>
          <textarea
            id="edit-txn-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              clearError();
            }}
            placeholder="Add a note... (optional)"
            maxLength={1000}
            rows={3}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 text-foreground dark:bg-card w-full resize-none rounded-xl border bg-transparent p-4 text-base transition-colors outline-none focus-visible:ring-3"
          />
          {notes.length > 0 && (
            <p className="text-muted-foreground mt-1 text-right text-xs">{notes.length}/1000</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}

        {/* Save Changes */}
        <div className="pt-8">
          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              'h-14 w-full rounded-xl text-base font-bold disabled:opacity-100',
              hasChanges && isFormValid && !isPending
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Delete Transaction */}
        <div className="mt-8">
          <Button
            type="button"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 h-14 w-full rounded-xl text-base font-bold"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-5 w-5" />
            Delete Transaction
          </Button>
        </div>
      </form>

      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transactionId={tx.id}
        transactionTitle={tx.title}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page loader — handles loading and error states
// ---------------------------------------------------------------------------

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const { data: transaction, isLoading, isError } = useTransaction(id ?? '');

  if (isLoading) {
    return (
      <div className="bg-background flex h-dvh flex-col">
        <div className="relative flex min-h-14 items-center px-4 pt-[max(env(safe-area-inset-top),16px)]">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="absolute left-1/2 h-6 w-36 -translate-x-1/2" />
        </div>
        <div className="flex-1 space-y-6 px-5 pt-8">
          <div>
            <Skeleton className="mb-2 h-3 w-12" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-10" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-12" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <Skeleton className="mt-8 h-14 w-full rounded-xl" />
          <Skeleton className="mt-3 h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="bg-background flex h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-destructive text-sm">Transaction not found</p>
        <AppLink
          to="/transactions"
          className="text-primary inline-flex min-h-11 items-center text-sm underline"
        >
          Back to transactions
        </AppLink>
      </div>
    );
  }

  // Transfer transactions cannot be edited — the detail page hides the edit
  // button, but guard against direct URL navigation as well.
  if (transaction.transferId) {
    return (
      <div className="bg-background flex h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-muted-foreground text-sm">Transfer transactions cannot be edited</p>
        <AppLink
          to={`/transactions/${id}`}
          className="text-primary inline-flex min-h-11 items-center text-sm underline"
        >
          Back to transaction
        </AppLink>
      </div>
    );
  }

  return <EditTransactionForm transaction={transaction} />;
}
