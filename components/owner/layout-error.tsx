"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

// Shown by the owner layout when it can't load the cafe context. app/owner/
// error.tsx sits below the layout, so it can't catch the layout's own errors.
// router.refresh() re-runs the layout on the server, which is the retry.
export function OwnerLayoutError() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load your cafe. Please try again — if it keeps
        happening, contact the Nook team.
      </p>
      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={isPending}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Retrying…" : "Try again"}
      </button>
    </div>
  )
}
