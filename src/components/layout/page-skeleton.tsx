import { Skeleton } from '@/components/ui/skeleton';

/** Header bar skeleton matching PageHeaderBar's flex layout (left-aligned title). */
function HeaderBarSkeleton() {
  return (
    <div className="flex min-h-14 items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="flex min-h-11 min-w-11 items-center justify-center">
        <Skeleton className="size-6 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-32" />
    </div>
  );
}

function FieldSkeleton({ labelWidth = 'w-16' }: { labelWidth?: string }) {
  return (
    <div>
      <Skeleton className={`mb-2 h-3.5 ${labelWidth}`} />
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}

/** Skeleton for form pages (create/edit wallet, transaction, budget). */
export function FormPageSkeleton() {
  return (
    <div className="bg-background flex h-dvh flex-col" role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <HeaderBarSkeleton />
      <div className="flex-1 space-y-6 px-5 pt-8">
        <FieldSkeleton labelWidth="w-12" />
        <FieldSkeleton labelWidth="w-16" />
        <FieldSkeleton labelWidth="w-20" />
        <FieldSkeleton labelWidth="w-10" />
        <Skeleton className="mt-8 h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Skeleton for the transaction detail page. */
export function DetailPageSkeleton() {
  return (
    <div
      className="bg-background min-h-dvh px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),24px)]"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      <div className="flex items-center gap-2 pt-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="flex flex-col items-center gap-2 py-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="space-y-3 pt-4">
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  );
}

/** Skeleton for list/settings pages (categories, profile). */
export function ListPageSkeleton() {
  return (
    <div className="bg-background flex h-dvh flex-col" role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <HeaderBarSkeleton />
      <div className="flex-1 space-y-3 px-5 pt-6">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
