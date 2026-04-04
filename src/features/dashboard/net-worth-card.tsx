import { createElement } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, getCurrencyIcon } from '@/lib/currency';
import type { Currency } from '@/api/types';

interface NetWorthCardProps {
  netWorth: number;
  currency: Currency;
  conversionAvailable: boolean;
}

export function NetWorthCard({ netWorth, currency, conversionAvailable }: NetWorthCardProps) {
  const currencyIcon = getCurrencyIcon(currency);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Currency icon badge */}
          <div className="bg-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
            {createElement(currencyIcon, { className: 'h-5 w-5 text-accent-soft-foreground' })}
          </div>

          {/* Label */}
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Total Net Worth
          </p>

          {/* Amount */}
          {conversionAvailable ? (
            <p className="text-foreground text-3xl font-bold tracking-tight">
              {formatCurrency(netWorth, currency)}
            </p>
          ) : (
            <>
              <p className="text-foreground text-3xl font-bold tracking-tight">—</p>
              <p className="text-muted-foreground text-xs">Exchange rates unavailable</p>
            </>
          )}
          {/* TODO: Add change indicator when API supports month-over-month comparison */}
        </div>
      </CardContent>
    </Card>
  );
}
