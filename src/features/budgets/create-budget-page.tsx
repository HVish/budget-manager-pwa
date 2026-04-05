import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { useBudgets, useCreateBudget } from '@/api/hooks/use-budgets';
import { useProfile } from '@/api/hooks/use-profile';
import { useScrollIntoViewOnFocus } from '@/hooks/use-scroll-into-view-on-focus';
import { parseAmount } from '@/lib/currency';
import { inputClassName } from '@/lib/form-constants';
import { useAppNavigate } from '@/lib/navigation';
import { getCategoryMeta, allBudgetableCategories } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { TransactionCategory, Currency } from '@/api/types';
import { currencies } from '@/features/wallets/wallet-form-constants';

// TRANSFER and CORRECTION are excluded by allBudgetableCategories

export default function CreateBudgetPage() {
  const navigate = useAppNavigate();
  const profileQuery = useProfile();
  const budgetsQuery = useBudgets();
  const createBudget = useCreateBudget();

  const defaultCurrency = profileQuery.data?.currency ?? 'INR';

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [currencyOverride, setCurrencyOverride] = useState<Currency | null>(null);
  const currency = currencyOverride ?? defaultCurrency;
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  useScrollIntoViewOnFocus(formRef);

  const existingCategories = new Set((budgetsQuery.data ?? []).map((b) => b.category));

  const availableCategories = allBudgetableCategories.filter((cat) => !existingCategories.has(cat));

  const isAmountValid = parseAmount(amount) > 0;
  const isCategoryValid = !!category;
  const isFormValid = isAmountValid && isCategoryValid;
  const isPending = createBudget.isPending;

  function getFirstError(): string | null {
    if (!isCategoryValid) return 'Please select a category';
    if (!isAmountValid) return 'Please enter an amount';
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
      await createBudget.mutateAsync({
        category: category as TransactionCategory,
        limitAmount: parseAmount(amount),
        currency,
      });
      navigate(-1);
    } catch {
      setError('Failed to create budget. Please try again.');
    }
  }

  const categoryItems = Object.fromEntries(
    availableCategories.map((cat) => [cat, getCategoryMeta(cat).label]),
  );

  return (
    <div className="bg-background flex h-dvh flex-col">
      <PageHeaderBar title="New Budget" onClose={() => navigate(-1)} />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 space-y-6 overflow-y-auto px-5 pt-8 pb-[max(env(safe-area-inset-bottom),24px)]"
      >
        {/* Category */}
        <div>
          <FieldLabel htmlFor="budget-category">Category</FieldLabel>
          {availableCategories.length === 0 ? (
            <p className="text-muted-foreground text-sm">All categories have been budgeted.</p>
          ) : (
            <Select
              value={category}
              items={categoryItems}
              onValueChange={(v) => {
                setCategory(v ?? '');
                setError(null);
              }}
            >
              <SelectTrigger
                id="budget-category"
                className={cn(
                  inputClassName,
                  'w-full',
                  submitted && !category && 'border-destructive',
                )}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => {
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
          )}
          {submitted && !category && availableCategories.length > 0 && (
            <p className="text-destructive mt-1 text-sm">Please select a category</p>
          )}
        </div>

        {/* Amount */}
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
          {submitted && !isAmountValid && (
            <p className="text-destructive mt-1 text-sm">Please enter an amount</p>
          )}
        </div>

        {/* Currency */}
        <div>
          <FieldLabel htmlFor="budget-currency">Currency</FieldLabel>
          <Select
            value={currency}
            onValueChange={(v) => setCurrencyOverride((v ?? defaultCurrency) as Currency)}
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

        {/* Submit */}
        <div className="pt-8">
          <Button
            type="submit"
            disabled={isPending || availableCategories.length === 0}
            className={cn(
              'h-14 w-full rounded-xl text-base font-bold disabled:opacity-100',
              isFormValid && !isPending
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : 'Save Budget'}
          </Button>
        </div>
      </form>
    </div>
  );
}
