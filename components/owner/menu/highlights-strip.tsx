"use client"

import * as React from "react"
import { Plus, UploadSimple, X } from "@phosphor-icons/react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { HIGHLIGHT_LIMIT, itemPriceLabel, type MenuItem } from "./types"

const TILE =
  "relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-lg"

function FilledSlot({
  item,
  uploading,
  onRemove,
  onUpload,
}: {
  item: MenuItem
  uploading: boolean
  onRemove: () => void
  onUpload: (file: File) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const missingPhoto = !item.image_url

  return (
    <li className="min-w-0">
      <div className="relative">
        {missingPhoto ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUpload(file)
                e.target.value = ""
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                TILE,
                "flex-col gap-1.5 border border-dashed border-amber-400 bg-amber-50 text-[13px] font-medium text-amber-800 outline-hidden transition-colors hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70",
              )}
            >
              {uploading ? (
                <Spinner className="size-4" />
              ) : (
                <UploadSimple className="size-4" aria-hidden />
              )}
              {uploading ? "Uploading…" : "Add a photo"}
              <span className="sr-only">for {item.name}</span>
            </button>
          </>
        ) : (
          <div className={cn(TILE, "bg-muted")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url!}
              alt=""
              className="size-full object-cover"
            />
          </div>
        )}
        {/* Remove sits on the tile's corner, the way photo pickers do it. It
            only drops the highlight; the item and its photo stay. */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name} from highlights`}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full border bg-background text-muted-foreground outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" weight="bold" aria-hidden />
        </button>
      </div>
      <p className="mt-2 truncate text-[13px] font-medium">{item.name}</p>
      {missingPhoto ? (
        <p className="text-xs leading-snug text-amber-800 dark:text-amber-300">
          Hidden in the app until it has a photo
        </p>
      ) : (
        <p className="text-xs text-muted-foreground tabular-nums">
          {itemPriceLabel(item)}
        </p>
      )}
    </li>
  )
}

function EmptySlot({ first }: { first: boolean }) {
  return (
    <li className="min-w-0" aria-label="Empty highlight slot">
      <div
        className={cn(
          TILE,
          "flex-col gap-1.5 border border-dashed text-[13px] text-muted-foreground",
        )}
      >
        <Plus className="size-4" aria-hidden />
        Highlight an item
      </div>
      {first && (
        <p className="mt-2 text-xs text-muted-foreground">
          Turn on Highlight in any row
        </p>
      )}
    </li>
  )
}

export function HighlightsStrip({
  items,
  uploadingItemId,
  onRemove,
  onUpload,
}: {
  items: MenuItem[]
  uploadingItemId: string | null
  onRemove: (id: string) => void
  onUpload: (id: string, file: File) => void
}) {
  const empty = Math.max(0, HIGHLIGHT_LIMIT - items.length)

  return (
    <section
      aria-labelledby="highlights-heading"
      className="rounded-xl border bg-card p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="highlights-heading" className="text-[15px] font-semibold">
            Menu highlights
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Up to five items, shown with a photo at the top of your café page.
          </p>
        </div>
        <p className="shrink-0 text-[13px] font-medium tabular-nums">
          {items.length} of {HIGHLIGHT_LIMIT}
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <FilledSlot
            key={item.id}
            item={item}
            uploading={uploadingItemId === item.id}
            onRemove={() => onRemove(item.id)}
            onUpload={(file) => onUpload(item.id, file)}
          />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <EmptySlot key={`empty-${i}`} first={i === 0} />
        ))}
      </ul>
    </section>
  )
}
