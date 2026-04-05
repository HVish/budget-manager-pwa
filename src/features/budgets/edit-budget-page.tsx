import { useState, useRef } from 'react';
import { useParams } from 'react-router';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { FieldLabel } from '@/components/ui/field-label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { useBudget, useUpdateBudget } from '@/api/hooks/use-budgets';
import { useScrollIntoViewOnFocus } from '@/hooks/use-scroll-into-view-on-focus';
import { formatAmount, parseAmount } from '@/lib/currency';
import { inputClassName } from '@/lib/form-constants';
import { useAppNavigate } from '@/lib/navigation';
import { getCategoryMeta } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { Budget, Currency } from '@/api/types';
import { currencies } from '@/features/wallets/wallet-form-constants';
import { DeleteBudgetDialog } from './delete-budget-dialog';

// ---------------------------------------------------------------------------
// Inner form — rendered only once budget is loaded
// ---------------------------------------------------------------------------

interface EditBudgetFormProps {
  budget: Budget;
}

function EditBudgetForm({ budget }: EditBudgetFormProps) {
  const navigate = useAppNavigate();
  const updateBudget = useUpdateBudget(budget.id);

  const [amount, setAmount] = useState(formatAmount(budget.limitAmount));
  const [currency, setCurrency] = useState<Currency>(budget.currency);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  useScrollIntoViewOnFocus(formRef);

  const meta = getCategoryMeta(budget.category);
  const Icon = meta.icon;

  const newAmount = parseAmount(amount);
  const hasAmountChanged = newAmount !== budget.limitAmount;
  const hasCurrencyChanged = currency !== budget.currency;
  const hasChanges = hasAmountChanged || hasCurrencyChanged;
  const isAmountValid = newAmount > 0;
  const isFormValid = isAmountValid && hasChanges;
  const isPending = updateBudget.isPending;

  function getFirstError(): string | null {
    if (!isAmountValid) return 'Please enter an amount';
    if (!hasChanges) return 'No changes to save';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) {
      const error = getFirstError();
      if (error) toast.error(error);
      return;
    }
    setError(null);

    try {
      await updateBudget.mutateAsync({
        limitAmount: newAmount,
        currency,
      });
      navigate(-1);
    } catch {
      setError('Failed to save changes. Please try again.');
    }
  }

  return (
    <div className="bg-background flex h-dvh flex-col">
      <PageHeaderBar title="Edit Budget" onClose={() => navigate(-1)} />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 space-y-6 overflow-y-auto px-5 pt-8 pb-[max(env(safe-area-inset-bottom),24px)]"
      >
        {/* Category (read-only) */}
        <div>
          <FieldLabel>Category</FieldLabel>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                meta.color,
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-foreground text-base font-semibold">{meta.label}</p>
          </div>
        </div>

        {/* Monthly Limit */}
        <div>
          <FieldLabel htmlFor="budget-amount">Monthly Limit</FieldLabel>
          <CurrencyInput
            id="budget-amount"
            value={amount}
            onChange={(v) => {
              setAmount(v);
              setError(null);
            }}
            currency={currency}
            allowNegative={false}
            aria-label="Monthly budget limit"
          />
        </div>

        {/* Currency */}
        <div>
          <FieldLabel htmlFor="budget-currency">Currency</FieldLabel>
          <Select
            value={currency}
            onValueChange={(v) => setCurrency((v ?? budget.currency) as Currency)}
          >
            <SelectTrigger id="budget-currency" className={cn(inputClassName, 'w-full')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              hasChanges && !isPending
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Delete Budget */}
        <div>
          <Button
            type="button"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 h-14 w-full rounded-xl text-base font-bold"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-5 w-5" />
            Delete Budget
          </Button>
        </div>
      </form>

      <DeleteBudgetDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        budgetId={budget.id}
        categoryLabel={meta.label}
        onDeleted={() => navigate('/budgets')}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page loader
// ---------------------------------------------------------------------------

export default function EditBudgetPage() {
  const { id } = useParams<{ id: string }>();
  const { data: budget, isLoading, isError } = useBudget(id ?? '');

  if (isLoading) {
    return (
      <div className="bg-background flex h-dvh flex-col">
        <div className="relative flex min-h-14 items-center px-4 pt-[max(env(safe-area-inset-top),16px)]">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="absolute left-1/2 h-6 w-28 -translate-x-1/2" />
        </div>
        <div className="flex-1 space-y-6 px-5 pt-8">
          <div>
            <Skeleton className="mb-2 h-3 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <Skeleton className="mt-4 h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !budget) {
    return (
      <div className="bg-background flex h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-destructive text-sm">Budget not found</p>
        <AppLink
          to="/budgets"
          className="text-primary inline-flex min-h-11 items-center text-sm underline"
        >
          Back to budgets
        </AppLink>
      </div>
    );
  }

  return <EditBudgetForm budget={budget} />;
}
