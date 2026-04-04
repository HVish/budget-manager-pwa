import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateWallet, useUpdateWallet } from "@/api/hooks/use-wallets";
import { parseAmount, formatAmount } from "@/lib/currency";
import type { Wallet, WalletType, Currency } from "@/api/types";

interface WalletFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet?: Wallet;
}

const walletTypes: { value: WalletType; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit Card" },
  { value: "investment", label: "Investment" },
];

const currencies: Currency[] = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

export function WalletForm({ open, onOpenChange, wallet }: WalletFormProps) {
  const isEdit = !!wallet;
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet(wallet?.id ?? "");

  const [name, setName] = useState(wallet?.name ?? "");
  const [walletType, setWalletType] = useState<WalletType>(
    wallet?.walletType ?? "checking"
  );
  const [currency, setCurrency] = useState<Currency>(
    wallet?.currency ?? "INR"
  );
  const [balance, setBalance] = useState(
    wallet ? formatAmount(wallet.balance) : "0.00"
  );
  const [accountNumber, setAccountNumber] = useState(
    wallet?.accountNumber ?? ""
  );

  const isPending = createWallet.isPending || updateWallet.isPending;

  const walletId = wallet?.id;
  useEffect(() => {
    if (open) {
      setName(wallet?.name ?? "");
      setWalletType(wallet?.walletType ?? "checking");
      setCurrency(wallet?.currency ?? "INR");
      setBalance(wallet ? formatAmount(wallet.balance) : "0.00");
      setAccountNumber(wallet?.accountNumber ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, walletId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEdit) {
      await updateWallet.mutateAsync({
        name: name.trim(),
        balance: parseAmount(balance),
        currency,
        accountNumber: accountNumber || undefined,
      });
    } else {
      await createWallet.mutateAsync({
        name: name.trim(),
        walletType,
        currency,
        balance: parseAmount(balance),
        accountNumber: accountNumber || undefined,
      });
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Wallet" : "New Wallet"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="wallet-name" className="text-sm font-medium">Name</label>
            <Input
              id="wallet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chase Checking"
              required
            />
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label htmlFor="wallet-type" className="text-sm font-medium">Type</label>
              <Select
                value={walletType}
                onValueChange={(v) => setWalletType(v as WalletType)}
              >
                <SelectTrigger id="wallet-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {walletTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="wallet-currency" className="text-sm font-medium">Currency</label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as Currency)}
              >
                <SelectTrigger id="wallet-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="wallet-balance" className="text-sm font-medium">Balance</label>
              <Input
                id="wallet-balance"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="wallet-account" className="text-sm font-medium">Account Number</label>
            <Input
              id="wallet-account"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Last 4 digits (optional)"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Wallet"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
