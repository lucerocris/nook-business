"use client"

import { WarningCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div
        role="alert"
        className="mx-auto flex max-w-3xl flex-col items-center rounded-xl border bg-card px-6 py-12 text-center"
      >
        <WarningCircleIcon className="size-6 text-destructive" aria-hidden />
        <h1 className="mt-3 text-lg font-semibold">We couldn’t load your dashboard</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Check your connection and try again. If it keeps happening,{" "}
          <a
            href="https://instagram.com/nook_cafefinder"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
          >
            message the Nook team
          </a>
          .
        </p>
        <Button variant="outline" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
}
