"use client"

import * as React from "react"
import { ForkKnife, Plus, Trash, UploadSimple, X } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { HIGHLIGHT_LIMIT, type Category, type MenuItem } from "./types"

export type SizeDraft = {
  id?: string
  label: string
  price: string
  isDefault: boolean
}

export type ItemFormState = {
  name: string
  price: string
  categoryId: string
  is_highlight: boolean
  sizes: SizeDraft[]
}

export const EMPTY_ITEM_FORM: ItemFormState = {
  name: "",
  price: "",
  categoryId: "",
  is_highlight: false,
  sizes: [],
}

function PesoInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
      >
        ₱
      </span>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        className="pl-7 tabular-nums"
        {...props}
      />
    </div>
  )
}

function SizesEditor({
  sizes,
  onChange,
}: {
  sizes: SizeDraft[]
  onChange: (sizes: SizeDraft[]) => void
}) {
  const newLabelRef = React.useRef<HTMLInputElement>(null)
  // Set by "Add a size" so the new row's name field takes focus once it renders.
  const focusNew = React.useRef(false)

  React.useEffect(() => {
    if (!focusNew.current) return
    focusNew.current = false
    newLabelRef.current?.focus()
  }, [sizes.length])

  function update(index: number, patch: Partial<SizeDraft>) {
    onChange(sizes.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function remove(index: number) {
    const next = sizes.filter((_, i) => i !== index)
    // Keep exactly one default while any sizes remain.
    if (next.length > 0 && !next.some((s) => s.isDefault)) next[0] = { ...next[0], isDefault: true }
    onChange(next)
  }

  function add() {
    onChange([...sizes, { label: "", price: "", isDefault: sizes.length === 0 }])
    focusNew.current = true
  }

  return (
    <div>
      <ul className="overflow-hidden rounded-lg border">
        {sizes.map((size, i) => (
          <li key={size.id ?? `new-${i}`} className="flex items-center gap-2 border-b py-1.5 pr-1.5 pl-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Input
                ref={i === sizes.length - 1 ? newLabelRef : undefined}
                aria-label={`Size ${i + 1} name`}
                placeholder="e.g. 12 oz"
                value={size.label}
                onChange={(e) => update(i, { label: e.target.value })}
                className="h-9 min-w-0 flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
              />
              {size.isDefault ? (
                <span className="shrink-0 text-xs font-medium text-primary">Default</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onChange(sizes.map((s, j) => ({ ...s, isDefault: j === i })))}
                  className="shrink-0 rounded-md px-1 text-xs text-muted-foreground outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Make default
                </button>
              )}
            </div>
            <PesoInput
              aria-label={`Size ${i + 1} price`}
              placeholder="0"
              value={size.price}
              onChange={(e) => update(i, { price: e.target.value })}
              className="w-28 shrink-0"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove size ${size.label || i + 1}`}
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={add}
            className="flex min-h-11 w-full items-center gap-2 px-3 text-sm text-muted-foreground outline-hidden hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <Plus className="size-4" aria-hidden />
            Add a size
          </button>
        </li>
      </ul>
      {sizes.length > 1 && (
        <p className="mt-2 text-xs text-muted-foreground">
          The default size is the one the app shows first.
        </p>
      )}
    </div>
  )
}

function PhotoField({
  imageUrl,
  pendingFile,
  busy,
  onPick,
  onRemove,
}: {
  imageUrl: string | null
  pendingFile: File | null
  busy: boolean
  onPick: (file: File) => void
  onRemove: (() => void) | null
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const preview = React.useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile]
  )
  React.useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  const src = preview ?? imageUrl

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(file)
          e.target.value = ""
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
      >
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
          {busy ? (
            <Spinner className="size-4" />
          ) : src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <ForkKnife className="size-5 text-muted-foreground" aria-hidden />
          )}
        </span>
        <span className="grid min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            {!src && <UploadSimple className="size-3.5" aria-hidden />}
            {src ? "Photo" : "Add a photo"}
          </span>
          <span className="text-xs text-muted-foreground">
            {src ? "Click to change" : "Click to upload"} · JPG, PNG, WEBP · max 10 MB
          </span>
        </span>
      </button>
      {src && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          aria-label="Remove photo"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-muted hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}

export function EditItemPanel({
  open,
  onOpenChange,
  editingItem,
  form,
  setForm,
  categories,
  highlightCount,
  pendingImageFile,
  setPendingImageFile,
  photoBusy,
  onUploadPhoto,
  onRemovePhoto,
  onNewCategory,
  onSave,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: MenuItem | null
  form: ItemFormState
  setForm: React.Dispatch<React.SetStateAction<ItemFormState>>
  categories: Category[]
  highlightCount: number
  pendingImageFile: File | null
  setPendingImageFile: (file: File | null) => void
  photoBusy: boolean
  onUploadPhoto: (file: File) => void
  onRemovePhoto: () => void
  onNewCategory: () => void
  onSave: () => void
  isSaving: boolean
}) {
  const isEditing = editingItem !== null
  const hasSizes = form.sizes.length > 0
  const defaultSize = form.sizes.find((s) => s.isDefault) ?? form.sizes[0]
  // A highlight already counted in highlightCount doesn't need a free slot.
  const usedSlots = highlightCount - (editingItem?.is_highlight ? 1 : 0)
  const slotsFull = usedSlots >= HIGHLIGHT_LIMIT
  const nook = categories.filter((c) => c.is_global)
  const yours = categories.filter((c) => !c.is_global)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[480px]"
      >
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <SheetTitle className="flex-1 text-base font-semibold">
            {isEditing ? "Edit item" : "Add item"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {isEditing ? "Change this item’s name, price, sizes or highlight." : "Add an item to your menu."}
          </SheetDescription>
          <kbd className="hidden rounded border px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground sm:inline">
            esc
          </kbd>
          <SheetClose className="flex size-9 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            <X className="size-4" aria-hidden />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>

        <form
          id="menu-item-form"
          className="flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 py-5"
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
        >
          <fieldset className="space-y-4">
            <legend className="mb-3 text-sm font-semibold">Item</legend>
            <div className="space-y-1.5">
              <Label htmlFor="item-name">Item name</Label>
              <Input
                id="item-name"
                placeholder="e.g. Spanish latte"
                autoComplete="off"
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="text-base sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="item-price">Base price (₱)</Label>
                {/* With sizes, the default size's price is the base price, so
                    it is shown here rather than typed twice. */}
                <PesoInput
                  id="item-price"
                  placeholder="0"
                  value={hasSizes ? (defaultSize?.price ?? "") : form.price}
                  readOnly={hasSizes}
                  aria-describedby={hasSizes ? "item-price-help" : undefined}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className={cn(hasSizes && "[&_input]:bg-muted")}
                />
                {hasSizes && (
                  <p id="item-price-help" className="text-xs text-muted-foreground">
                    Set by the default size
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-category">Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger id="item-category" className="h-9 w-full">
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    {yours.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Yours</SelectLabel>
                        {yours.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    <SelectGroup>
                      <SelectLabel>From Nook</SelectLabel>
                      {nook.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={onNewCategory}
                  className="inline-flex min-h-7 items-center rounded-md text-xs font-medium text-primary outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  New category
                </button>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <legend className="text-sm font-semibold">Sizes &amp; prices</legend>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Leave empty to use the base price. One size is the default the app shows first.
            </p>
            <SizesEditor
              sizes={form.sizes}
              onChange={(sizes) => setForm((f) => ({ ...f, sizes }))}
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-semibold">Highlight</legend>
            <label
              htmlFor="item-highlight"
              className={cn(
                "flex items-center justify-between gap-4 rounded-lg border px-4 py-3",
                slotsFull && !form.is_highlight ? "cursor-not-allowed" : "cursor-pointer"
              )}
            >
              <span className="grid">
                <span className="text-sm font-medium">Feature as highlight</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {slotsFull && !form.is_highlight
                    ? `All ${HIGHLIGHT_LIMIT} slots are used — turn one off first`
                    : `${usedSlots + (form.is_highlight ? 1 : 0)} of ${HIGHLIGHT_LIMIT} slots used`}
                </span>
              </span>
              <Switch
                id="item-highlight"
                checked={form.is_highlight}
                disabled={slotsFull && !form.is_highlight}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_highlight: v }))}
              />
            </label>
            {form.is_highlight &&
              (isEditing ? (
                <PhotoField
                  imageUrl={editingItem.image_url}
                  pendingFile={editingItem.image_url ? null : pendingImageFile}
                  busy={photoBusy}
                  onPick={onUploadPhoto}
                  onRemove={editingItem.image_url ? onRemovePhoto : null}
                />
              ) : (
                <PhotoField
                  imageUrl={null}
                  pendingFile={pendingImageFile}
                  busy={false}
                  onPick={setPendingImageFile}
                  onRemove={() => setPendingImageFile(null)}
                />
              ))}
          </fieldset>
        </form>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-3.5">
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="menu-item-form"
            loading={isSaving}
            disabled={!form.name.trim() || !form.categoryId}
          >
            {isEditing ? "Save changes" : "Add item"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
