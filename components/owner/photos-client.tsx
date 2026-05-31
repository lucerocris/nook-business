"use client"

import * as React from "react"
import {
  CaretLeft,
  CaretRight,
  Crown,
  DotsSixVertical,
  Image,
  Info,
  Lightbulb,
  Plus,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  uploadCafeHeroAction,
  uploadCafePhotoAction,
  deleteCafePhotoAction,
  reorderCafePhotosAction,
} from "@/app/actions/upload"
import imageCompression from "browser-image-compression"

const TOTAL_SLOTS = 5

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
  const [isReordering, setIsReordering] = React.useState(false)
  const [uploadError, setUploadError] = React.useState("")
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)

  const allPhotos = [
    ...(currentHeroUrl ? [currentHeroUrl] : []),
    ...currentPhotoUrls.filter((u) => u !== currentHeroUrl),
  ]
  const usedSlots = allPhotos.length
  const usedPct = Math.round((usedSlots / TOTAL_SLOTS) * 100)

  function applyOrderedPhotos(ordered: string[]) {
    setCurrentHeroUrl(ordered[0] ?? null)
    setCurrentPhotoUrls(ordered.slice(1))
  }

  async function persistPhotoOrder(ordered: string[]) {
    const previous = allPhotos
    applyOrderedPhotos(ordered)
    setIsReordering(true)
    setUploadError("")

    try {
      await reorderCafePhotosAction(ordered, cafeId)
      return true
    } catch (err: unknown) {
      applyOrderedPhotos(previous)
      const msg = err instanceof Error ? err.message : "Reorder failed"
      setUploadError(msg)
      toast.error(msg)
      setTimeout(() => setUploadError(""), 4000)
      return false
    } finally {
      setIsReordering(false)
    }
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= allPhotos.length || isUploading || isReordering) {
      return
    }

    const ordered = [...allPhotos]
    const [moved] = ordered.splice(index, 1)
    ordered.splice(target, 0, moved)
    const saved = await persistPhotoOrder(ordered)
    if (saved) toast.success("Photo order updated")
  }

  async function setAsHero(url: string) {
    if (isUploading || isReordering || url === allPhotos[0]) return
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

    if (isUploading || isReordering) {
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
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append("file", compressed)

      if (isHero) {
        const { url } = await uploadCafeHeroAction(formData, cafeId)
        setCurrentHeroUrl(url)
        toast.success("Hero photo uploaded")
      } else {
        const { url } = await uploadCafePhotoAction(formData, cafeId)
        setCurrentPhotoUrls((prev) => [...prev, url])
        toast.success("Photo uploaded")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      setUploadError(msg)
      toast.error(msg)
      setTimeout(() => setUploadError(""), 4000)
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  async function handleDeleteConfirm() {
    if (deleteConfirm === null) return
    const photo  = allPhotos[deleteConfirm]
    const isHero = photo === currentHeroUrl
    setDeleteConfirm(null)
    setIsUploading(true)
    try {
      await deleteCafePhotoAction(photo, isHero, cafeId)
      if (isHero) {
        const gallery = currentPhotoUrls.filter((u) => u !== photo)
        setCurrentHeroUrl(gallery[0] ?? null)
        setCurrentPhotoUrls(gallery.slice(1))
      } else {
        setCurrentPhotoUrls((prev) => prev.filter((u) => u !== photo))
      }
      toast.success("Photo deleted")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      setUploadError(msg)
      toast.error(msg)
      setTimeout(() => setUploadError(""), 4000)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold">Photos</h1>
          <p className="text-sm text-muted-foreground">
            Manage your cafe&apos;s photos. The hero photo appears everywhere in
            the app.
          </p>
        </div>

  

        {/* Hero Photo Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Hero photo</CardTitle>
                <CardDescription>
                  This is your main photo shown on cafe cards, map pins, and
                  your cafe page header.
                </CardDescription>
              </div>
              <Badge variant="secondary">Required</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

              {/* Hero preview */}
              <div className="relative w-full sm:w-48 sm:shrink-0">
                <div className="aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed border-primary/30 overflow-hidden">
                  {currentHeroUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentHeroUrl}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Image size={32} />
                      <p className="text-xs">Hero photo</p>
                    </>
                  )}
                </div>
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                  Hero
                </Badge>
              </div>

              {/* Right content */}
              <div className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">
                  This photo appears as the main image for your cafe throughout
                  the app. Use a high-quality, well-lit photo of your cafe
                  interior or exterior.
                </p>

                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Requirements:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                    <li>JPG, PNG, or WEBP format</li>
                    <li>Maximum 10MB file size</li>
                    <li>Landscape orientation recommended</li>
                    <li>Minimum 800px wide</li>
                  </ul>
                </div>

                <label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      <UploadSimple size={16} />
                      {isUploading ? "Uploading..." : "Replace hero photo"}
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, true)}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Gallery photos</CardTitle>
                <CardDescription>
                  Add up to 5 photos total, including your hero photo.
                </CardDescription>
              </div>
              <Badge variant="outline">{usedSlots} / {TOTAL_SLOTS} used</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex flex-row justify-between">
                <span className="text-xs text-muted-foreground">
                  Photo slots used
                </span>
                <span className="text-xs font-medium">{usedSlots} of {TOTAL_SLOTS}</span>
              </div>
              <Progress value={usedPct} className="h-1.5" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allPhotos.map((url, i) => (
                <div
                  key={url}
                  className="relative group"
                  draggable={!isUploading && !isReordering}
                  onDragStart={() => handleDragStart(i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => void handleDrop(i)}
                >
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                  {url === currentHeroUrl && (
                    <Badge className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground z-10">
                      Hero
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="absolute top-2 right-2 text-[10px] z-10 bg-background/90"
                  >
                    <DotsSixVertical size={10} />
                    <span className="hidden sm:inline">Drag</span>
                  </Badge>
                  <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="size-7"
                      onClick={() => void movePhoto(i, -1)}
                      disabled={i === 0 || isUploading || isReordering}
                      aria-label={`Move photo ${i + 1} left`}
                    >
                      <CaretLeft size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="size-7"
                      onClick={() => void movePhoto(i, 1)}
                      disabled={i === allPhotos.length - 1 || isUploading || isReordering}
                      aria-label={`Move photo ${i + 1} right`}
                    >
                      <CaretRight size={14} />
                    </Button>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    {url !== currentHeroUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => void setAsHero(url)}
                        disabled={isUploading || isReordering}
                      >
                        <Crown size={12} />
                        Set hero
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs h-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm(i)}
                      disabled={isUploading || isReordering}
                    >
                      <Trash size={12} />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {usedSlots < TOTAL_SLOTS && (
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="aspect-square h-full w-full border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      <Plus size={20} />
                      <span className="text-xs">
                        {isUploading ? "Uploading..." : "Add photo"}
                      </span>
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, false)}
                  />
                </label>
              )}
            </div>

            {usedSlots >= TOTAL_SLOTS && (
              <p className="text-xs text-muted-foreground">
                Maximum 5 photos reached
              </p>
            )}

            {uploadError && (
              <p className="text-sm text-destructive mt-2">{uploadError}</p>
            )}

            <p className="text-xs text-muted-foreground">
              Tip: Drag to reorder on desktop, or use arrow buttons on mobile.
              The first photo is the hero.
            </p>
          </CardContent>
        </Card>

        {/* Photo Tips Card */}
        <Card className="border-dashed bg-muted/30">
          <CardHeader>
            <div className="flex flex-row items-center gap-2">
              <Lightbulb size={16} className="text-muted-foreground" />
              <CardTitle className="text-sm">Photo tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="size-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <p className="text-xs text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phase 3 Upgrade Callout */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">Want more photos?</p>
            <p className="text-xs text-muted-foreground">
              Unlimited photos available in Phase 3 with a Premium listing.
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto">Phase 3</Badge>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This photo will be permanently removed from your listing.
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
