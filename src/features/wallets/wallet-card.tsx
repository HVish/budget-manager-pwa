import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { Landmark, Banknote, CreditCard, PiggyBank, TrendingUp } from 'lucide-react';
import type { Wallet } from '@/api/types';

const walletTypeConfig: Record<string, { icon: typeof Landmark; label: string }> = {
  checking: { icon: Landmark, label: 'Checking' },
  savings: { icon: PiggyBank, label: 'Savings' },
  cash: { icon: Banknote, label: 'Cash' },
  credit: { icon: CreditCard, label: 'Credit' },
  investment: { icon: TrendingUp, label: 'Investment' },
};

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const navigate = useNavigate();
  const config = walletTypeConfig[wallet.walletType] ?? walletTypeConfig.checking;
  const Icon = config.icon;

  return (
    <Card
      className="hover:bg-accent/50 cursor-pointer transition-all duration-150 active:scale-[0.98]"
      onClick={() => navigate(`/wallets/${wallet.id}`)}
    >
      <CardContent className="flex items-center gap-3 py-3">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Icon className="text-primary h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{wallet.name}</p>
          <p className="text-muted-foreground text-xs">
            {config.label}
            {wallet.accountNumber && ` · ${wallet.accountNumber}`}
          </p>
        </div>
        <span className="text-sm font-semibold whitespace-nowrap">
          {formatCurrency(wallet.balance, wallet.currency)}
        </span>
      </CardContent>
    </Card>
  );
}
