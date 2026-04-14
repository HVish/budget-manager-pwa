import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateWallet } from '@/api/hooks/use-wallets';
import { useProfile } from '@/api/hooks/use-profile';
import { useScrollIntoViewOnFocus } from '@/hooks/use-scroll-into-view-on-focus';
import { parseAmount } from '@/lib/currency';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { WalletType, Currency } from '@/api/types';
import { WalletFormHeader } from './wallet-form-header';
import { FieldLabel } from '@/components/ui/field-label';
import { inputClassName } from '@/lib/form-constants';
import { walletTypes, currencies } from './wallet-form-constants';

export default function CreateWalletPage() {
  const navigate = useAppNavigate();
  const profileQuery = useProfile();
  const createWallet = useCreateWallet();

  const defaultCurrency = profileQuery.data?.currency ?? 'INR';

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('checking');
  const [currencyOverride, setCurrencyOverride] = useState<Currency | null>(null);
  const currency = currencyOverride ?? defaultCurrency;
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  useScrollIntoViewOnFocus(formRef);

  const isFormValid = !!name.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!isFormValid) {
      toast.error('Please enter a wallet name');
      return;
    }
    setError(null);

    try {
      await createWallet.mutateAsync({
        name: name.trim(),
        walletType,
        currency,
        balance: parseAmount(balance),
        accountNumber: accountNumber || undefined,
      });
      navigate('/wallets');
    } catch {
      setError('Failed to create wallet. Please try again.');
    }
  }

  const isPending = createWallet.isPending;

  return (
    <div className="bg-background flex h-dvh flex-col">
      <WalletFormHeader title="New Wallet" onClose={() => navigate('/wallets')} />

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
            maxLength={255}
            className={cn(inputClassName, submitted && !name.trim() && 'border-destructive')}
          />
          {submitted && !name.trim() && (
            <p className="text-destructive mt-1 text-sm">Please enter a wallet name</p>
          )}
        </div>

        {/* Initial Balance */}
        <div>
          <FieldLabel htmlFor="wallet-balance">Initial Balance</FieldLabel>
          <CurrencyInput
            id="wallet-balance"
            value={balance}
            onChange={(v) => {
              setBalance(v);
              setError(null);
            }}
            currency={currency}
            allowNegative={true}
            aria-label="Initial balance"
          />
        </div>

        {/* Wallet Type + Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="wallet-type">Wallet Type</FieldLabel>
            <Select
              value={walletType}
              items={walletTypes}
              onValueChange={(v) => setWalletType(v as WalletType)}
            >
              <SelectTrigger id="wallet-type" className={cn(inputClassName, 'w-full')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {walletTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value} label={t.label}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <FieldLabel htmlFor="wallet-currency">Currency</FieldLabel>
            <Select
              value={currency}
              items={currencies}
              onValueChange={(v) => setCurrencyOverride(v as Currency)}
            >
              <SelectTrigger id="wallet-currency" className={cn(inputClassName, 'w-full')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value} label={c.label}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Account Number */}
        <div>
          <FieldLabel htmlFor="wallet-account">Account Number</FieldLabel>
          <Input
            id="wallet-account"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="e.g. ···· 1234 (optional)"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={255}
            className={inputClassName}
          />
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
            {isPending ? 'Saving...' : 'Save Wallet'}
          </Button>
        </div>
      </form>
    </div>
  );
}
