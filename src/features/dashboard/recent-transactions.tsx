import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { getCategoryMeta } from "@/lib/categories";
import type { DashboardTransaction } from "@/api/types";

interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions.length) {
    return (
      <div>
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No transactions this month
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {transactions.map((tx) => {
            const meta = getCategoryMeta(tx.category);
            const Icon = meta.icon;
            const isIncome = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-md px-2 py-2"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.color} text-white`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{tx.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(tx.transactionDate), "MMM d")}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap ${isIncome ? "text-income" : "text-expense"}`}
                >
                  {isIncome ? "+" : ""}
                  {formatCurrency(tx.amount, tx.currency)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
