"use client"

import * as React from "react"
import { ForkKnife } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"

export function EmptyMenu({ onAdd }: { onAdd: () => void }) {
  const [showHelp, setShowHelp] = React.useState(false)

  return (
    <section aria-label="Menu items" className="overflow-hidden rounded-xl border bg-card">
      {/* Column headers stay, so the empty frame reads as a list waiting to
          be filled rather than a missing section. */}
      <div aria-hidden className="flex items-center border-b bg-muted/60 px-5 py-3 text-xs text-muted-foreground">
        <span className="flex-1">Item</span>
        <span className="hidden w-16 text-right sm:block">Price</span>
        <span className="hidden w-20 text-right sm:block">Highlight</span>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-10 text-center sm:py-12">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
            <ForkKnife className="size-5" aria-hidden />
          </span>
          <h2 className="mt-3 text-base font-semibold">Your menu is empty</h2>
          <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Add what you serve and its price. People see it on your café page, and you can pick
            up to five highlights.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Button onClick={onAdd}>Add your first item</Button>
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              aria-expanded={showHelp}
              className="inline-flex min-h-9 items-center rounded-md px-1 text-[13px] font-medium outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              How highlights work
            </button>
          </div>
          {showHelp && (
            <p className="mt-4 max-w-sm rounded-lg bg-muted px-4 py-3 text-left text-[13px] leading-relaxed text-muted-foreground">
              Turn on Highlight for up to five items and give each a photo. They show at the top
              of your café page in the Nook app, so pick what people should try first.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
