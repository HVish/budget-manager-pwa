import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMonthRange, getPrevMonth, getNextMonth, isFutureMonth } from '@/lib/date';

interface MonthState {
  year: number;
  month: number;
  setMonth: (year: number, month: number) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
}

const now = new Date();

export const useMonthStore = create<MonthState>()(
  persist(
    (set, get) => ({
      year: now.getFullYear(),
      month: now.getMonth() + 1,

      setMonth: (year, month) => {
        if (!isFutureMonth(year, month)) {
          set({ year, month });
        }
      },

      goToPrevMonth: () => {
        const { year, month } = get();
        const prev = getPrevMonth(year, month);
        set(prev);
      },

      goToNextMonth: () => {
        const { year, month } = get();
        const next = getNextMonth(year, month);
        if (!isFutureMonth(next.year, next.month)) {
          set(next);
        }
      },
    }),
    { name: 'budget-month' },
  ),
);

export function useMonthRange() {
  const { year, month } = useMonthStore();
  return getMonthRange(year, month);
}
