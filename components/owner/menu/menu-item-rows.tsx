"use client"

import * as React from "react"
import { ForkKnife, PencilSimple, Star, Trash, UploadSimple } from "@phosphor-icons/react"

import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { HIGHLIGHT_LIMIT, itemDetailLine, type MenuItem } from "./types"

export type MenuSection = { id: string; name: string; items: MenuItem[] }

function Thumb({
  item,
  uploading,
  onUpload,
}: {
  item: MenuItem
  uploading: boolean
  onUpload: (file: File) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Only highlights carry a photo; other rows keep the column empty so names
  // still line up. On phones the empty column is given back to the text.
  if (!item.is_highlight) return <span aria-hidden className="hidden size-12 shrink-0 sm:block" />

  if (item.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image_url} alt="" className="size-12 shrink-0 rounded-lg bg-muted object-cover" />
    )
  }

  return (
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
        aria-label={`Add a photo for ${item.name}`}
        className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-amber-400 bg-amber-50 text-amber-800 outline-hidden hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
      >
        {uploading ? <Spinner className="size-4" /> : <UploadSimple className="size-4" aria-hidden />}
      </button>
    </>
  )
}

function ItemRow({
  item,
  capReached,
  uploading,
  onToggleHighlight,
  onEdit,
  onDelete,
  onUpload,
}: {
  item: MenuItem
  capReached: boolean
  uploading: boolean
  onToggleHighlight: (value: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onUpload: (file: File) => void
}) {
  const blocked = capReached && !item.is_highlight

  return (
    <li className="flex items-start gap-3 border-t px-4 py-3.5 first:border-t-0 sm:gap-4 sm:px-5">
      <Thumb item={item} uploading={uploading} onUpload={onUpload} />
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 text-sm font-semibold break-words">{item.name}</span>
          {item.is_highlight && (
            <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[11px] font-medium">
              <Star className="size-2.5" weight="fill" aria-hidden />
              Highlight
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] break-words text-muted-foreground tabular-nums">
          {itemDetailLine(item)}
        </p>
        {item.is_highlight && !item.image_url && (
          <p className="mt-0.5 text-[13px] text-amber-800">Add a photo so it shows in the app</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <span
          className="flex size-10 items-center justify-center"
          title={blocked ? `All ${HIGHLIGHT_LIMIT} highlight slots are used` : undefined}
        >
          <Switch
            checked={item.is_highlight}
            disabled={blocked}
            onCheckedChange={onToggleHighlight}
            aria-label={`Highlight ${item.name}`}
          />
        </span>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${item.name}`}
          className="flex size-10 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PencilSimple className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${item.name}`}
          className="flex size-10 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-muted hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  )
}

export function MenuItemRows({
  sections,
  highlightCount,
  uploadingItemId,
  onToggleHighlight,
  onEdit,
  onDelete,
  onUpload,
}: {
  sections: MenuSection[]
  highlightCount: number
  uploadingItemId: string | null
  onToggleHighlight: (id: string, value: boolean) => void
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  onUpload: (id: string, file: File) => void
}) {
  const capReached = highlightCount >= HIGHLIGHT_LIMIT

  return (
    <section aria-label="Menu items" className="overflow-hidden rounded-xl border bg-card">
      {sections.length === 0 && (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <ForkKnife className="size-5 text-muted-foreground" aria-hidden />
          <p className="mt-2 text-sm font-semibold">Nothing in this category yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick it as the category when you add or edit an item.
          </p>
        </div>
      )}
      {sections.map((section, i) => (
        <div key={section.id} className={cn(i > 0 && "border-t")}>
          <h3 className="flex items-baseline gap-2 border-b bg-muted/60 px-4 py-3 sm:px-5">
            <span className="text-sm font-semibold">{section.name}</span>
            <span className="text-[13px] text-muted-foreground tabular-nums">
              {section.items.length} {section.items.length === 1 ? "item" : "items"}
            </span>
          </h3>
          <ul>
            {section.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                capReached={capReached}
                uploading={uploadingItemId === item.id}
                onToggleHighlight={(v) => onToggleHighlight(item.id, v)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.id)}
                onUpload={(file) => onUpload(item.id, file)}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
