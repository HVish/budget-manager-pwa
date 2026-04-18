import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/ui/field-label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { useCreateCategory } from '@/api/hooks/use-categories';
import { useScrollIntoViewOnFocus } from '@/hooks/use-scroll-into-view-on-focus';
import { inputClassName } from '@/lib/form-constants';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { CategoryType } from '@/api/types';

export default function CreateCategoryPage() {
  const navigate = useAppNavigate();
  const createCategory = useCreateCategory();
  const formRef = useRef<HTMLFormElement>(null);
  useScrollIntoViewOnFocus(formRef);

  const [displayName, setDisplayName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isValid = displayName.trim().length > 0;
  const isPending = createCategory.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    try {
      setError('');
      await createCategory.mutateAsync({
        displayName: displayName.trim(),
        type,
      });
      toast.success('Category created');
      navigate('/categories');
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response: Response }).response;
        if (resp.status === 409) {
          setError('A category with this name already exists');
          return;
        }
      }
      setError('Failed to create category. Please try again.');
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeaderBar title="New Category" onClose={() => navigate(-1)} />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 space-y-6 overflow-y-auto px-5 pt-8 pb-[max(env(safe-area-inset-bottom),24px)]"
      >
        {/* Name */}
        <div>
          <FieldLabel htmlFor="cat-name">Name</FieldLabel>
          <Input
            id="cat-name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError('');
            }}
            placeholder="e.g. Subscriptions"
            maxLength={100}
            autoFocus
            className={cn(inputClassName, 'w-full', submitted && !isValid && 'border-destructive')}
          />
          {submitted && !isValid && (
            <p className="text-destructive mt-1 text-sm">Category name is required</p>
          )}
        </div>

        {/* Type */}
        <div>
          <FieldLabel htmlFor="cat-type">Type</FieldLabel>
          <Select
            value={type}
            items={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
            onValueChange={(v) => setType((v ?? 'expense') as CategoryType)}
          >
            <SelectTrigger id="cat-type" className={cn(inputClassName, 'w-full')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense" label="Expense">
                Expense
              </SelectItem>
              <SelectItem value="income" label="Income">
                Income
              </SelectItem>
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
            disabled={isPending}
            className={cn(
              'h-14 w-full rounded-xl text-base font-bold disabled:opacity-100',
              isValid && !isPending
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : 'Save Category'}
          </Button>
        </div>
      </form>
    </div>
  );
}
