import { Skeleton } from "@/components/ui/skeleton"

export default function OwnerLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <Skeleton className="h-8 w-44 rounded-md" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
