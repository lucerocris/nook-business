"use client"

import { FloppyDisk } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// Shared unsaved-changes bar for pages that save on demand (Edit Listing,
// Tags). It used to be copied into each page as `fixed left-0 right-0`, which
// on desktop spread it under the sidebar: "You have unsaved changes" sat on
// the green rail and covered Logout. It now starts where the sidebar ends,
// following it when collapsed to icons.
export function SaveBar({
  visible,
  saving,
  onSave,
  onDiscard,
}: {
  visible: boolean
  saving: boolean
  onSave: () => void
  onDiscard: () => void
}) {
  const { state } = useSidebar()
  if (!visible) return null

  return (
    <>
      {/* Reserves room so the bar never covers the page's last card. */}
      <div aria-hidden="true" className="h-24 shrink-0 sm:h-20" />
      <div
        role="region"
        aria-label="Unsaved changes"
        className={cn(
          "fixed right-0 bottom-0 left-0 z-40 border-t bg-background/95 backdrop-blur",
          state === "collapsed"
            ? "md:left-(--sidebar-width-icon)"
            : "md:left-(--sidebar-width)"
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Unsaved changes
          </p>
          <Button variant="ghost" onClick={onDiscard} disabled={saving}>
            Discard
          </Button>
          <Button onClick={onSave} loading={saving}>
            {saving ? null : <FloppyDisk className="size-4" />}
            Save changes
          </Button>
        </div>
      </div>
    </>
  )
}
