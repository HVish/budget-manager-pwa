import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMonthStore } from "@/stores/month-store";
import { formatMonthYear, isFutureMonth, getNextMonth } from "@/lib/date";

export function MonthSelector() {
  const { year, month, goToPrevMonth, goToNextMonth } = useMonthStore();
  const next = getNextMonth(year, month);
  const canGoNext = !isFutureMonth(next.year, next.month);

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={goToPrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[130px] text-center text-sm font-medium">
        {formatMonthYear(year, month)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={goToNextMonth}
        disabled={!canGoNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
