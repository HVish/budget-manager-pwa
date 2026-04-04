import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWalletHistory } from '@/api/hooks/use-wallets';
import { useMonthRange } from '@/stores/month-store';
import { formatCurrency } from '@/lib/currency';

interface BalanceHistoryChartProps {
  walletId: string;
  currency: string;
}

export function BalanceHistoryChart({ walletId, currency }: BalanceHistoryChartProps) {
  const { startDate, endDate } = useMonthRange();
  const { data, isLoading } = useWalletHistory(walletId, startDate, endDate);

  if (isLoading) {
    return (
      <div className="px-4">
        <Card>
          <CardContent className="py-4">
            <Skeleton className="h-52 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="px-4">
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            No balance history for this period
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = data.map((entry) => ({
    date: entry.date,
    balance: entry.balance / 100,
  }));

  return (
    <div className="px-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            30-Day Balance Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => format(parseISO(v), 'd')}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const entry = payload[0].payload as (typeof chartData)[0];
                  return (
                    <div className="bg-popover rounded-lg border px-3 py-2 text-xs shadow-md">
                      <p className="text-muted-foreground">
                        {format(parseISO(entry.date), 'MMM d')}
                      </p>
                      <p className="font-medium">{formatCurrency(entry.balance * 100, currency)}</p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#balanceGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
