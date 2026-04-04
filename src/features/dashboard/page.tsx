import { useDashboard } from "@/api/hooks/use-dashboard";
import { useWallets } from "@/api/hooks/use-wallets";
import { useMonthStore } from "@/stores/month-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IncomeExpenseCard } from "./income-expense-card";
import { WalletSummary } from "./wallet-summary";
import { RecentTransactions } from "./recent-transactions";

export default function DashboardPage() {
  const { year, month } = useMonthStore();
  const dashboard = useDashboard(year, month);
  const wallets = useWallets();

  if (dashboard.isLoading) {
    return (
      <div className="space-y-4 px-4">
        {/* Net worth card: CardContent py-4 + text-2xl ~80px */}
        <Skeleton className="h-24 w-full rounded-xl" />
        {/* Income/Expense cards: CardContent py-3 + text-lg ~72px */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-xl" />
          <Skeleton className="h-[72px] rounded-xl" />
        </div>
        {/* Net this month card: CardContent py-3 ~44px */}
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Wallet summary card: header + 3-4 rows ~160px */}
        <Skeleton className="h-40 w-full rounded-xl" />
        {/* Recent transactions: header + 5 rows ~280px */}
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (dashboard.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
        <p className="text-sm text-destructive">Failed to load dashboard</p>
        <Button variant="link" onClick={() => dashboard.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const data = dashboard.data!;

  return (
    <div className="space-y-4 px-4 pb-4">
      <IncomeExpenseCard
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
        netWorth={data.netWorth}
        currency={data.primaryCurrency}
        conversionAvailable={data.conversionAvailable}
      />
      <WalletSummary wallets={wallets.data ?? []} />
      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  );
}
