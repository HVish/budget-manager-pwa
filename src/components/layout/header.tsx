import { Wallet } from "lucide-react";
import { MonthSelector } from "@/components/month-selector";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Budget</span>
        </div>
        <MonthSelector />
      </div>
    </header>
  );
}
