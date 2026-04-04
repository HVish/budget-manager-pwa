import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type { Wallet } from "@/api/types";

interface WalletSummaryProps {
  wallets: Wallet[];
}

const walletTypeLabel: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  cash: "Cash",
  credit: "Credit",
  investment: "Investment",
};

export function WalletSummary({ wallets }: WalletSummaryProps) {
  const navigate = useNavigate();

  if (!wallets.length) return null;

  return (
    <div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Wallets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {wallets.map((w) => (
            <button
              key={w.id}
              onClick={() => navigate(`/wallets/${w.id}`)}
              className="flex w-full items-center justify-between rounded-md px-2 py-2.5 min-h-[44px] text-left transition-colors hover:bg-accent"
            >
              <div>
                <p className="text-sm font-medium">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  {walletTypeLabel[w.walletType] ?? w.walletType}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(w.balance, w.currency)}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
