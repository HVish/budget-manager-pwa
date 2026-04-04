import { useNavigate } from 'react-router';
import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { walletTypeConfig, getWalletSubtitle } from '@/lib/wallet-types';
import { cn } from '@/lib/utils';
import type { Wallet, BalanceHistoryEntry } from '@/api/types';
import { WalletSparkline } from './wallet-sparkline';

interface WalletCardProps {
  wallet: Wallet;
  sparklineData?: BalanceHistoryEntry[];
  onEdit: (wallet: Wallet) => void;
}

export function WalletCard({ wallet, sparklineData, onEdit }: WalletCardProps) {
  const navigate = useNavigate();
  const config = walletTypeConfig[wallet.walletType] ?? walletTypeConfig.checking;
  const Icon = config.icon;
  const isNegative = wallet.balance < 0;

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit(wallet);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/wallets/${wallet.id}`);
    }
  }

  return (
    <Card
      role="article"
      aria-label={`${wallet.name}, balance ${formatCurrency(wallet.balance, wallet.currency)}`}
      tabIndex={0}
      className="hover:bg-accent/50 focus-visible:ring-ring cursor-pointer gap-0 py-0 transition-all duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]"
      onClick={() => navigate(`/wallets/${wallet.id}`)}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-4">
        {/* Row 1: Identity */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                config.iconBg,
              )}
            >
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-medium">{wallet.name}</p>
              <p className="text-muted-foreground truncate text-xs">{getWalletSubtitle(wallet)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleEdit}
            aria-label={`Edit ${wallet.name}`}
          >
            <Pencil className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Row 2: Balance + sparkline */}
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs">{config.balanceLabel}</p>
            <p
              className={cn(
                'text-xl font-bold tracking-tight text-nowrap',
                isNegative ? 'text-expense' : 'text-foreground',
              )}
            >
              {formatCurrency(wallet.balance, wallet.currency)}
            </p>
          </div>
          <div className="h-8 w-16 shrink-0">
            {sparklineData && (
              <WalletSparkline walletId={wallet.id} data={sparklineData} positive={!isNegative} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
