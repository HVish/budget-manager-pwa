import { Skeleton } from '@/components/ui/skeleton';

export function BudgetsSkeleton() {
  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-2">
        <Skeleton className="h-30 rounded-2xl" />
        <Skeleton className="h-30 rounded-2xl" />
      </div>

      {/* Section header */}
      <div className="px-4 pt-4 pb-2">
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Budget card skeletons */}
      <div className="space-y-3 px-4 pb-24">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </>
  );
}
