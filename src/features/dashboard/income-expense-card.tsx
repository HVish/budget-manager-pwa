import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface IncomeExpenseCardProps {
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
  currency: string;
  conversionAvailable: boolean;
}

export function IncomeExpenseCard({
  totalIncome,
  totalExpense,
  netWorth,
  currency,
  conversionAvailable,
}: IncomeExpenseCardProps) {
  const net = totalIncome - totalExpense;

  return (
    <div className="space-y-3">
      {/* Net worth banner */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">Net Worth</p>
          <p className="text-2xl font-bold">
            {conversionAvailable ? formatCurrency(netWorth, currency) : "—"}
          </p>
          {!conversionAvailable && (
            <p className="text-xs text-muted-foreground">
              Exchange rates unavailable
            </p>
          )}
        </CardContent>
      </Card>

      {/* Income / Expense row */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-income" />
              Income
            </div>
            <p className="mt-1 text-lg font-semibold text-income">
              {formatCurrency(totalIncome, currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5 text-expense" />
              Expense
            </div>
            <p className="mt-1 text-lg font-semibold text-expense">
              {formatCurrency(totalExpense, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Net this month */}
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">
            Net this month
          </span>
          <span
            className={`text-sm font-semibold ${net >= 0 ? "text-income" : "text-expense"}`}
          >
            {formatCurrency(net, currency)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
