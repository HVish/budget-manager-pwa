import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { FieldLabel } from '@/components/ui/field-label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { useCreateTransaction, useCreateTransfer } from '@/api/hooks/use-transactions';
import { useWallets } from '@/api/hooks/use-wallets';
import { useProfile } from '@/api/hooks/use-profile';
import { useScrollIntoViewOnFocus } from '@/hooks/use-scroll-into-view-on-focus';
import { parseAmount } from '@/lib/currency';
import { inputClassName } from '@/lib/form-constants';
import { useAppNavigate } from '@/lib/navigation';
import { getCategoryMeta, incomeCategories, expenseCategories } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { TransactionCategory } from '@/api/types';
import { TransactionTypeTabs, type TransactionType } from './transaction-type-tabs';

// ---------------------------------------------------------------------------
// Error extraction helper
// ---------------------------------------------------------------------------

async function extractErrorMessage(err: unknown, type: TransactionType): Promise<string> {
  const fallback =
    type === 'transfer'
      ? 'Failed to save transfer. Please try again.'
      : 'Failed to save transaction. Please try again.';

  if (err && typeof err === 'object' && 'response' in err) {
    try {
      const body = await (err as { response: Response }).response.json();
      const reason = body?.['invalid-params']?.[0]?.reason;
      if (typeof reason === 'string') {
        return reason;
      }
    } catch {
      /* ignore parse errors */
    }
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function CreateTransactionPage() {
  const navigate = useAppNavigate();
  const profileQuery = useProfile();
  const walletsQuery = useWallets();
  const createTransaction = useCreateTransaction();
  const createTransfer = useCreateTransfer();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [walletId, setWalletId] = useState('');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  useScrollIntoViewOnFocus(formRef);

  // ── Field change helper (clear error on any field change) ──────────────

  function withErrorClear<T extends string>(setter: React.Dispatch<React.SetStateAction<T>>) {
    return (value: T) => {
      setter(value);
      setError(null);
    };
  }

  const handleAmountChange = withErrorClear(setAmount);
  const handleTitleChange = withErrorClear(setTitle);
  const handleWalletChange = withErrorClear(setWalletId);
  const handleFromWalletChange = withErrorClear(setFromWalletId);
  const handleToWalletChange = withErrorClear(setToWalletId);
  const handleDateChange = withErrorClear(setDate);
  const handleCategoryChange = withErrorClear(setCategory);
  const handleNotesChange = withErrorClear(setNotes);

  // ── Derived values ──────────────────────────────────────────────────────

  const wallets = walletsQuery.data ?? [];

  const selectedWallet = wallets.find((w) =>
    type === 'transfer' ? w.id === fromWalletId : w.id === walletId,
  );
  const currency = selectedWallet?.currency ?? profileQuery.data?.currency ?? 'INR';

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  // Static items map so base-ui can resolve labels when the portal is closed
  const walletItems = Object.fromEntries(wallets.map((w) => [w.id, w.name]));
  const categoryItems = Object.fromEntries(
    categories.map((cat) => [cat, getCategoryMeta(cat).label]),
  );

  // ── Form validation ─────────────────────────────────────────────────────

  const isAmountValid = parseAmount(amount) > 0;
  const isTitleValid = type === 'transfer' || title.trim().length > 0;
  const isWalletValid =
    type === 'transfer'
      ? !!fromWalletId && !!toWalletId && fromWalletId !== toWalletId
      : !!walletId;
  const isCategoryValid = type === 'transfer' || !!category;
  const isDateValid = !!date;

  const isFormValid =
    isAmountValid && isTitleValid && isWalletValid && isCategoryValid && isDateValid;

  const isPending = createTransaction.isPending || createTransfer.isPending;

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    setCategory('');
    setError(null);
    setSubmitted(false);
  }

  const titlePlaceholder =
    type === 'income'
      ? 'e.g. Monthly salary'
      : type === 'transfer'
        ? 'e.g. Savings transfer'
        : 'e.g. Weekly groceries';

  function getFirstError(): string | null {
    if (!isWalletValid) {
      if (type === 'transfer') {
        if (!fromWalletId) return 'Please select a From wallet';
        if (!toWalletId) return 'Please select a To wallet';
        return 'From and To wallets must be different';
      }
      return 'Please select a wallet';
    }
    if (!isAmountValid) return 'Please enter an amount';
    if (!isTitleValid) return 'Please enter a title';
    if (!isCategoryValid) return 'Please select a category';
    if (!isDateValid) return 'Please select a date';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!isFormValid) {
      const error = getFirstError();
      if (error) toast.error(error);
      return;
    }
    setError(null);

    try {
      if (type === 'transfer') {
        const amt = parseAmount(amount);
        await createTransfer.mutateAsync({
          fromWalletId,
          toWalletId,
          fromAmount: amt,
          toAmount: amt,
          transactionDate: date,
          title: title.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        const amt = parseAmount(amount);
        await createTransaction.mutateAsync({
          walletId,
          title: title.trim(),
          category: category as TransactionCategory,
          amount: type === 'income' ? amt : -amt,
          transactionDate: date,
          notes: notes.trim() || undefined,
        });
      }
      navigate(-1);
    } catch (err) {
      const message = await extractErrorMessage(err, type);
      setError(message);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="bg-background flex h-dvh flex-col">
      <PageHeaderBar title="New Transaction" onClose={() => navigate(-1)} />

      <TransactionTypeTabs value={type} onChange={handleTypeChange} />

      <div className="from-background pointer-events-none relative z-10 -mb-4 h-4 bg-linear-to-b to-transparent" />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 space-y-6 overflow-y-auto px-5 pt-4 pb-[max(env(safe-area-inset-bottom),24px)]"
      >
        {/* Wallet (income/expense) */}
        {type !== 'transfer' && (
          <div>
            <FieldLabel htmlFor="txn-wallet">Wallet</FieldLabel>
            <Select
              value={walletId}
              items={walletItems}
              onValueChange={(v) => handleWalletChange(v ?? '')}
            >
              <SelectTrigger
                id="txn-wallet"
                className={cn(
                  inputClassName,
                  'w-full',
                  submitted && !walletId && 'border-destructive',
                )}
              >
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && !walletId && (
              <p className="text-destructive mt-1 text-sm">Please select a wallet</p>
            )}
          </div>
        )}

        {/* From Wallet / To Wallet (transfer) */}
        {type === 'transfer' && (
          <>
            <div>
              <FieldLabel htmlFor="txn-from-wallet">From Wallet</FieldLabel>
              <Select
                value={fromWalletId}
                items={walletItems}
                onValueChange={(v) => handleFromWalletChange(v ?? '')}
              >
                <SelectTrigger
                  id="txn-from-wallet"
                  className={cn(
                    inputClassName,
                    'w-full',
                    submitted && !fromWalletId && 'border-destructive',
                  )}
                >
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitted && !fromWalletId && (
                <p className="text-destructive mt-1 text-sm">Please select a wallet</p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="txn-to-wallet">To Wallet</FieldLabel>
              <Select
                value={toWalletId}
                items={walletItems}
                onValueChange={(v) => handleToWalletChange(v ?? '')}
              >
                <SelectTrigger
                  id="txn-to-wallet"
                  className={cn(
                    inputClassName,
                    'w-full',
                    submitted && !toWalletId && 'border-destructive',
                  )}
                >
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitted && !toWalletId && (
                <p className="text-destructive mt-1 text-sm">Please select a wallet</p>
              )}
              {fromWalletId && toWalletId && fromWalletId === toWalletId && (
                <p role="alert" className="text-destructive mt-1 text-sm">
                  From and To wallets must be different
                </p>
              )}
            </div>
          </>
        )}

        {/* Amount */}
        <div>
          <FieldLabel htmlFor="txn-amount">Enter Amount</FieldLabel>
          <CurrencyInput
            id="txn-amount"
            value={amount}
            onChange={handleAmountChange}
            currency={currency}
            allowNegative={false}
            aria-label="Transaction amount"
          />
          {submitted && !isAmountValid && (
            <p className="text-destructive mt-1 text-sm">Please enter an amount</p>
          )}
        </div>

        {/* Title */}
        <div>
          <FieldLabel htmlFor="txn-title">
            {type === 'transfer' ? 'Title (optional)' : 'Title'}
          </FieldLabel>
          <Input
            id="txn-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={titlePlaceholder}
            maxLength={255}
            className={cn(inputClassName, submitted && !isTitleValid && 'border-destructive')}
          />
          {submitted && !isTitleValid && (
            <p className="text-destructive mt-1 text-sm">Please enter a title</p>
          )}
        </div>

        {/* Category (income/expense only) */}
        {type !== 'transfer' && (
          <div>
            <FieldLabel htmlFor="txn-category">Category</FieldLabel>
            <Select
              value={category}
              items={categoryItems}
              onValueChange={(v) => handleCategoryChange(v ?? '')}
            >
              <SelectTrigger
                id="txn-category"
                className={cn(
                  inputClassName,
                  'w-full',
                  submitted && !category && 'border-destructive',
                )}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const meta = getCategoryMeta(cat);
                  const Icon = meta.icon;
                  return (
                    <SelectItem key={cat} value={cat}>
                      <span
                        className={cn(
                          'flex size-6 items-center justify-center rounded-full text-white',
                          meta.color,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {meta.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {submitted && !category && (
              <p className="text-destructive mt-1 text-sm">Please select a category</p>
            )}
          </div>
        )}

        {/* Date */}
        <div>
          <FieldLabel htmlFor="txn-date">Date</FieldLabel>
          <div className="relative">
            <Input
              id="txn-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
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
          <FieldLabel htmlFor="txn-notes">Notes</FieldLabel>
          <textarea
            id="txn-notes"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add a note... (optional)"
            maxLength={1000}
            rows={3}
            className={cn(
              'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 text-foreground dark:bg-card w-full resize-none rounded-xl border bg-transparent p-4 text-base transition-colors outline-none focus-visible:ring-3',
            )}
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

        {/* Submit */}
        <div className="pt-8">
          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              'h-14 w-full rounded-xl text-base font-bold disabled:opacity-100',
              isFormValid && !isPending
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : type === 'transfer' ? 'Save Transfer' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </div>
  );
}
