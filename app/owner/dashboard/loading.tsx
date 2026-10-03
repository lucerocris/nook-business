import { Skeleton } from "@/components/ui/skeleton"

// Mirrors the dashboard's layout so nothing jumps when the data arrives.
export default function DashboardLoading() {
  return (
    <div
      aria-busy
      aria-label="Loading your dashboard"
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
    >
      <Skeleton className="h-8 w-64 rounded-md" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
      <div className="mt-4 flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-5">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <div className="rounded-xl border p-5">
            <div className="flex gap-4">
              <Skeleton className="size-20 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-5">
            <Skeleton className="h-5 w-32 rounded-md" />
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-7 w-14 rounded-md" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-5 h-36 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-3 rounded-xl border p-5">
          <Skeleton className="h-5 w-40 rounded-md" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
