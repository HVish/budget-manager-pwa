import { Skeleton } from '@/components/ui/skeleton';

export function TransactionsPageSkeleton() {
  return (
    <div className="space-y-4 px-4">
      {Array.from({ length: 2 }).map((_, groupIdx) => (
        <div key={groupIdx} className="space-y-3.5">
          {/* Date header skeleton */}
          <div className="flex items-center justify-between px-1 pt-1 pb-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          {/* Row skeletons */}
          {Array.from({ length: groupIdx === 0 ? 3 : 2 }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="bg-card ring-foreground/10 flex items-center gap-3 rounded-xl p-3 ring-1"
            >
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
