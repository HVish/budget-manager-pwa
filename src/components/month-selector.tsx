import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { useMonthStore } from '@/stores/month-store';
import { formatMonthYear, isFutureMonth } from '@/lib/date';
import { subMonths, format } from 'date-fns';

/** Generate a list of {year, month} objects going back `count` months from today, newest first. */
function generateMonthList(count: number) {
  const now = new Date();
  const months: Array<{ year: number; month: number }> = [];
  for (let i = 0; i < count; i++) {
    const d = subMonths(now, i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (!isFutureMonth(year, month)) {
      months.push({ year, month });
    }
  }
  return months;
}

export function MonthSelectorSheet() {
  const { year, month, setMonth } = useMonthStore();
  const [open, setOpen] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Recompute the list once per calendar month so a long-lived PWA session
  // never shows stale months. The key changes every month: year*12 + month.
  const now = new Date();
  const currentMonthKey = now.getFullYear() * 12 + now.getMonth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const MONTH_LIST = useMemo(() => generateMonthList(24), [currentMonthKey]);

  // Auto-scroll selected month into view when sheet opens
  useEffect(() => {
    if (open && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [open]);

  function handleSelect(y: number, m: number) {
    setMonth(y, m);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5 rounded-full" />}
      >
        {formatMonthYear(year, month)}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex max-h-[60dvh] flex-col gap-0 rounded-t-2xl p-0"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-2">
          <SheetTitle className="text-base font-semibold">Select Month</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a month to view your budget data
          </SheetDescription>
          <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
            <X className="h-4 w-4" />
          </SheetClose>
        </div>

        <Separator />

        {/* Scrollable month list */}
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 pb-[env(safe-area-inset-bottom)]">
          {MONTH_LIST.map((item) => {
            const isSelected = item.year === year && item.month === month;
            return (
              <button
                key={`${item.year}-${item.month}`}
                ref={isSelected ? selectedRef : undefined}
                onClick={() => handleSelect(item.year, item.month)}
                className={`bg-card flex min-h-11 w-full items-center justify-between rounded-xl px-4 py-3 ring-1 transition-colors ${
                  isSelected
                    ? 'ring-primary text-primary'
                    : 'text-foreground hover:ring-border ring-transparent'
                }`}
              >
                <span className="text-sm font-medium">
                  {format(new Date(item.year, item.month - 1, 1), 'MMMM yyyy')}
                </span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
