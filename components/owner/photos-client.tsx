"use client"

import { Spinner } from "@/components/ui/spinner"
import * as React from "react"
import { DropdownMenu } from "radix-ui"
import {
  ArrowLeft,
  ArrowRight,
  DotsThree,
  Info,
  Star,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import {
  uploadCafeHeroAction,
  uploadCafePhotoAction,
  deleteCafePhotoAction,
  reorderCafePhotosAction,
} from "@/app/actions/upload"
import imageCompression from "browser-image-compression"

const TOTAL_SLOTS = 5

const ACCEPT = "image/jpeg,image/png,image/webp"

const menuItem =
  "flex min-h-11 cursor-default items-center gap-2.5 rounded-md px-2.5 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-40 data-highlighted:bg-muted sm:min-h-9"

const TIPS = [
  "Show the interior — customers want to know what the vibe feels like before visiting",
  "Good lighting makes a huge difference — natural light or warm interior lighting works best",
  "Landscape photos look better on cafe cards and the map preview",
  "Update your hero photo seasonally to keep your listing feeling fresh",
]

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  })
}

export function OwnerPhotosClient({
  heroUrl,
  photoUrls,
  cafeId,
}: {
  heroUrl: string | null
  photoUrls: string[]
  cafeId: string
}) {
  const [currentHeroUrl, setCurrentHeroUrl] = React.useState<string | null>(heroUrl)
  const [currentPhotoUrls, setCurrentPhotoUrls] = React.useState<string[]>(photoUrls)
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isReordering, setIsReordering] = React.useState(false)
  const [uploadError, setUploadError] = React.useState("")
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)

  const allPhotos = [
    ...(currentHeroUrl ? [currentHeroUrl] : []),
    ...currentPhotoUrls.filter((u) => u !== currentHeroUrl),
  ]
  const usedSlots = allPhotos.length

  function applyOrderedPhotos(ordered: string[]) {
    setCurrentHeroUrl(ordered[0] ?? null)
    setCurrentPhotoUrls(ordered.slice(1))
  }

  // Every photo action returns what's stored after the write; mirror it
  // exactly rather than predicting (the server may promote an upload to hero).
  function applyServerPhotos(state: { hero: string | null; gallery: string[] }) {
    setCurrentHeroUrl(state.hero)
    setCurrentPhotoUrls(state.gallery)
  }

  function showPhotoError(msg: string, toastId?: string | number) {
    setUploadError(msg)
    toast.error(msg, toastId === undefined ? undefined : { id: toastId })
    setTimeout(() => setUploadError(""), 4000)
  }

  async function persistPhotoOrder(ordered: string[]) {
    const previous = allPhotos
    applyOrderedPhotos(ordered)
    setIsReordering(true)
    setUploadError("")

    try {
      const res = await reorderCafePhotosAction(ordered, cafeId)
      if (!res.ok) {
        applyOrderedPhotos(previous)
        showPhotoError(res.error)
        return false
      }
      applyServerPhotos(res)
      return true
    } catch {
      applyOrderedPhotos(previous)
      showPhotoError("Couldn't save the new order. Check your connection and try again.")
      return false
    } finally {
      setIsReordering(false)
    }
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= allPhotos.length || isUploading || isDeleting || isReordering) {
      return
    }

    const ordered = [...allPhotos]
    const [moved] = ordered.splice(index, 1)
    ordered.splice(target, 0, moved)
    const saved = await persistPhotoOrder(ordered)
    if (saved) toast.success("Photo order updated")
  }

  async function setAsHero(url: string) {
    if (isUploading || isDeleting || isReordering || url === allPhotos[0]) return
    const ordered = [url, ...allPhotos.filter((photoUrl) => photoUrl !== url)]
    const saved = await persistPhotoOrder(ordered)
    if (saved) toast.success("Hero photo updated")
  }

  function handleDragStart(index: number) {
    setDraggingIndex(index)
  }

  function handleDragEnd() {
    setDraggingIndex(null)
  }

  async function handleDrop(targetIndex: number) {
    if (draggingIndex === null || draggingIndex === targetIndex) {
      setDraggingIndex(null)
      return
    }

    if (isUploading || isDeleting || isReordering) {
      setDraggingIndex(null)
      return
    }

    const ordered = [...allPhotos]
    const [moved] = ordered.splice(draggingIndex, 1)
    ordered.splice(targetIndex, 0, moved)
    setDraggingIndex(null)
    const saved = await persistPhotoOrder(ordered)
    if (saved) toast.success("Photo order updated")
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    isHero: boolean
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError("")
    // Compressing a large photo on a mid-range phone takes seconds before the
    // request even starts, so hold a loading toast across the whole operation
    // and resolve it in place.
    const toastId = toast.loading(
      isHero ? "Uploading hero photo…" : "Uploading photo…"
    )
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append("file", compressed)

      const res = isHero
        ? await uploadCafeHeroAction(formData, cafeId)
        : await uploadCafePhotoAction(formData, cafeId)
      if (!res.ok) {
        showPhotoError(res.error, toastId)
        return
      }
      const becameHero = !isHero && !currentHeroUrl && !!res.hero
      applyServerPhotos(res)
      toast.success(
        isHero ? "Hero photo uploaded" : becameHero ? "Photo uploaded and set as your hero" : "Photo uploaded",
        { id: toastId }
      )
    } catch {
      // Network drop, or a body over the Server Action size limit.
      showPhotoError("Upload failed. Check your connection and try again.", toastId)
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  async function handleDeleteConfirm() {
    if (deleteConfirm === null) return
    const photo  = allPhotos[deleteConfirm]
    setDeleteConfirm(null)
    // Tracked separately from isUploading: sharing that flag made every delete
    // label its button "Uploading…".
    setIsDeleting(true)
    const toastId = toast.loading("Deleting photo…")
    try {
      const res = await deleteCafePhotoAction(photo, cafeId)
      if (!res.ok) {
        showPhotoError(res.error, toastId)
        return
      }
      applyServerPhotos(res)
      toast.success("Photo deleted", { id: toastId })
    } catch {
      showPhotoError("Couldn't delete the photo. Check your connection and try again.", toastId)
    } finally {
      setIsDeleting(false)
    }
  }

  const busy = isUploading || isDeleting || isReordering
  const emptySlots = TOTAL_SLOTS - usedSlots

  // One file input per empty slot. A <label> wraps it so the whole tile is the
  // target; the input itself is disabled while anything is in flight so a
  // second pick can't race the first past the photo cap.
  function renderUploadSlot(hero: boolean, first: boolean, key: string) {
    const uploadingHere = isUploading && first
    return (
      <label
        key={key}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-input bg-background px-3 text-center text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground has-focus-visible:border-ring has-focus-visible:ring-2 has-focus-visible:ring-ring/50",
          hero
            ? "col-span-2 aspect-[3/2] lg:row-span-2 lg:aspect-auto lg:min-h-80"
            : "aspect-[3/2]",
          busy && "pointer-events-none opacity-60"
        )}
      >
        {uploadingHere ? <Spinner className="size-5" /> : <UploadSimple size={20} aria-hidden="true" />}
        <span className={cn("text-sm", hero && "font-medium text-foreground")}>
          {uploadingHere ? "Uploading…" : hero ? "Add your hero photo" : "Add photo"}
        </span>
        {hero && !uploadingHere && (
          <span className="max-w-xs text-xs text-balance">
            Shown on your card, your map pin and the top of your page
          </span>
        )}
        <input
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={busy}
          onChange={(e) => handleFileUpload(e, hero)}
        />
      </label>
    )
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Photos</h1>
            <p className="text-sm text-muted-foreground">
              The first photo is your hero — it&apos;s on your card, your map
              pin and the top of your page.
            </p>
          </div>
          {emptySlots > 0 && (
            <label
              className={cn(
                "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 has-focus-visible:ring-2 has-focus-visible:ring-ring/50 sm:h-9",
                busy && "pointer-events-none opacity-50"
              )}
            >
              {isUploading ? <Spinner className="size-4" /> : <UploadSimple size={16} aria-hidden="true" />}
              {isUploading ? "Uploading…" : currentHeroUrl ? "Upload photo" : "Upload hero photo"}
              <input
                type="file"
                accept={ACCEPT}
                className="sr-only"
                disabled={busy}
                onChange={(e) => handleFileUpload(e, !currentHeroUrl)}
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {allPhotos.map((url, i) => {
            const isHero = i === 0
            return (
              <div
                key={url}
                className={cn(
                  "group relative overflow-hidden rounded-xl bg-muted",
                  isHero
                    ? "col-span-2 aspect-[3/2] lg:row-span-2 lg:aspect-auto lg:min-h-80"
                    : "aspect-[3/2]",
                  draggingIndex === i && "opacity-50",
                  !busy && "sm:cursor-grab"
                )}
                draggable={!busy}
                onDragStart={() => handleDragStart(i)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => void handleDrop(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={isHero ? "Hero photo" : `Photo ${i + 1}`}
                  className="absolute inset-0 size-full object-cover"
                  draggable={false}
                />
                {isHero && (
                  <span className="absolute top-3 left-3 rounded-md bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                    Hero
                  </span>
                )}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger
                    disabled={busy}
                    aria-label={`Options for ${isHero ? "hero photo" : `photo ${i + 1}`}`}
                    className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:size-9"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-background text-foreground shadow-sm">
                      <DotsThree size={18} weight="bold" aria-hidden="true" />
                    </span>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      sideOffset={4}
                      className="z-50 min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) rounded-xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
                    >
                      {!isHero && (
                        <DropdownMenu.Item className={menuItem} onSelect={() => void setAsHero(url)}>
                          <Star size={16} aria-hidden="true" />
                          Make hero photo
                        </DropdownMenu.Item>
                      )}
                      <DropdownMenu.Item
                        className={menuItem}
                        disabled={i === 0}
                        onSelect={() => void movePhoto(i, -1)}
                      >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Move earlier
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className={menuItem}
                        disabled={i === allPhotos.length - 1}
                        onSelect={() => void movePhoto(i, 1)}
                      >
                        <ArrowRight size={16} aria-hidden="true" />
                        Move later
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="my-1 h-px bg-border" />
                      <DropdownMenu.Item
                        className={cn(menuItem, "text-destructive data-highlighted:bg-destructive/10")}
                        onSelect={() => setDeleteConfirm(i)}
                      >
                        <Trash size={16} aria-hidden="true" />
                        Delete photo
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            )
          })}

          {Array.from({ length: emptySlots }).map((_, n) =>
            renderUploadSlot(usedSlots === 0 && n === 0, n === 0, `empty-${n}`)
          )}
        </div>

        <div className="space-y-2">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>
              <span className="tabular-nums">
                {usedSlots} of {TOTAL_SLOTS} photos
              </span>
              {usedSlots >= TOTAL_SLOTS
                ? " · Delete one to add another."
                : usedSlots > 1
                  ? " · Drag to reorder, or use the menu on each photo · JPG, PNG or WEBP, up to 10 MB each."
                  : " · JPG, PNG or WEBP, up to 10 MB each. iPhone photos convert automatically."}
            </span>
          </p>
          {uploadError && (
            <p role="alert" className="text-sm text-destructive">
              {uploadError}
            </p>
          )}
        </div>

        <details className="group rounded-xl border px-4 py-3">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-medium outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-0 [&::-webkit-details-marker]:hidden">
            Photo tips
            <span className="text-xs font-normal text-muted-foreground group-open:hidden">Show</span>
            <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">Hide</span>
          </summary>
          <ul className="mt-3 grid list-disc gap-x-8 gap-y-2 pl-4 text-sm text-muted-foreground sm:grid-cols-2">
            {TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </details>
      </div>

      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from your café page and the app. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
