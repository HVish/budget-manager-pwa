import { useState, useRef } from 'react';
import { useParams } from 'react-router';
import { AppLink } from '@/components/ui/app-link';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyInput } from '@/components/ui/currency-input';
import { useWallet, useUpdateWallet } from '@/api/hooks/use-wallets';
import { useScrollIntoViewOnFocus } from '@/hooks/use-scroll-into-view-on-focus';
import { formatCurrency, formatAmount, parseAmount } from '@/lib/currency';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { Wallet, WalletUpdate } from '@/api/types';
import { WalletFormHeader } from './wallet-form-header';
import { BalanceDiffBadge } from './balance-diff-badge';
import { DeleteWalletDialog } from './delete-wallet-dialog';
import { FieldLabel } from '@/components/ui/field-label';
import { inputClassName } from '@/lib/form-constants';

// ---------------------------------------------------------------------------
// Inner form — rendered only once wallet is loaded; initializes state from props
// ---------------------------------------------------------------------------

interface EditWalletFormProps {
  wallet: Wallet;
}

function EditWalletForm({ wallet }: EditWalletFormProps) {
  const navigate = useAppNavigate();
  const updateWallet = useUpdateWallet(wallet.id);

  const [name, setName] = useState(wallet.name);
  const [balance, setBalance] = useState(formatAmount(wallet.balance));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  useScrollIntoViewOnFocus(formRef);

  const currentBalance = wallet.balance;
  const newBalanceMinor = parseAmount(balance);
  const hasBalanceChanged = newBalanceMinor !== currentBalance;
  const hasNameChanged = name.trim() !== wallet.name;
  const hasChanges = hasBalanceChanged || hasNameChanged;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !hasChanges) {
      toast.error('No changes to save');
      return;
    }
    setError(null);

    try {
      const payload: WalletUpdate = {};
      if (hasNameChanged) payload.name = name.trim();
      if (hasBalanceChanged) payload.balance = newBalanceMinor;

      await updateWallet.mutateAsync(payload);
      navigate(`/wallets/${wallet.id}`);
    } catch {
      setError('Failed to save changes. Please try again.');
    }
  }

  const isPending = updateWallet.isPending;

  return (
    <div className="bg-background flex h-dvh flex-col">
      <WalletFormHeader title="Edit Wallet" onClose={() => navigate(-1)} />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 space-y-6 overflow-y-auto px-5 pt-8 pb-[max(env(safe-area-inset-bottom),24px)]"
      >
        {/* Wallet Name */}
        <div>
          <FieldLabel htmlFor="wallet-name">Wallet Name</FieldLabel>
          <Input
            id="wallet-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Checking"
            required
            maxLength={255}
            className={inputClassName}
          />
        </div>

        {/* Current Balance (read-only display) */}
        <div>
          <FieldLabel>Current Balance</FieldLabel>
          <p className="text-foreground text-3xl font-bold tracking-tight">
            {formatCurrency(wallet.balance, wallet.currency)}
          </p>
        </div>

        {/* New Balance */}
        <div>
          <FieldLabel htmlFor="wallet-balance">New Balance</FieldLabel>
          <CurrencyInput
            id="wallet-balance"
            value={balance}
            onChange={setBalance}
            currency={wallet.currency}
            allowNegative={true}
            aria-label="New balance"
          />
        </div>

        {/* Balance diff badge */}
        {hasBalanceChanged && (
          <div className="-mt-3">
            <BalanceDiffBadge
              currentBalance={currentBalance}
              newBalance={newBalanceMinor}
              currency={wallet.currency}
            />
          </div>
        )}

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

        {/* Delete Wallet */}
        <div className="mt-8">
          <Button
            type="button"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 h-14 w-full rounded-xl text-base font-bold"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-5 w-5" />
            Delete Wallet
          </Button>
        </div>
      </form>

      <DeleteWalletDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        walletId={wallet.id}
        walletName={wallet.name}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page loader — handles loading and error states
// ---------------------------------------------------------------------------

export default function EditWalletPage() {
  const { id } = useParams<{ id: string }>();
  const { data: wallet, isLoading, isError } = useWallet(id ?? '');

  if (isLoading) {
    return (
      <div className="bg-background flex h-dvh flex-col">
        <div className="relative flex min-h-14 items-center px-4 pt-[max(env(safe-area-inset-top),16px)]">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="absolute left-1/2 h-6 w-28 -translate-x-1/2" />
        </div>
        <div className="flex-1 space-y-6 px-5">
          <div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="mb-1 h-4 w-32" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <Skeleton className="mt-8 h-14 w-full rounded-xl" />
          <Skeleton className="mt-3 h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !wallet) {
    return (
      <div className="bg-background flex h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-destructive text-sm">Wallet not found</p>
        <AppLink
          to="/wallets"
          className="text-primary inline-flex min-h-11 items-center text-sm underline"
        >
          Back to wallets
        </AppLink>
      </div>
    );
  }

  return <EditWalletForm wallet={wallet} />;
}
