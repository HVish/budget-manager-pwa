import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

export function getMonthRange(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  return {
    startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function getPrevMonth(year: number, month: number) {
  const prev = subMonths(new Date(year, month - 1, 1), 1);
  return { year: prev.getFullYear(), month: prev.getMonth() + 1 };
}

export function getNextMonth(year: number, month: number) {
  const next = addMonths(new Date(year, month - 1, 1), 1);
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

export function formatMonthYear(year: number, month: number): string {
  return format(new Date(year, month - 1, 1), 'MMMM yyyy');
}

export function isCurrentMonth(year: number, month: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month;
}

export function isFutureMonth(year: number, month: number): boolean {
  const now = new Date();
  const current = now.getFullYear() * 12 + now.getMonth();
  const target = year * 12 + (month - 1);
  return target > current;
}

export function getClientTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
