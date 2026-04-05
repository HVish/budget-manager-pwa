import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { BalanceHistoryEntry } from '@/api/types';

interface WalletSparklineProps {
  walletId: string;
  data: BalanceHistoryEntry[];
  positive: boolean;
}

export function WalletSparkline({ walletId, data, positive }: WalletSparklineProps) {
  // A single data point cannot form a meaningful trend line
  if (data.length < 2) return null;

  const gradientId = `sparkline-fill-${walletId}`;
  const strokeColor = positive ? 'var(--color-chart-1)' : 'var(--color-expense)';

  const chartData = data.map((entry) => ({
    date: entry.date,
    balance: entry.balance / 100,
  }));

  return (
    <div aria-hidden="true" className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="balance"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
