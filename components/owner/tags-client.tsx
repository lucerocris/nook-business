"use client"

import * as React from "react"
import { Check, Star } from "@phosphor-icons/react"
import { toast } from "sonner"

import { SaveBar } from "@/components/owner/save-bar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { updateTagsAction } from "@/app/owner/actions"
import { cn } from "@/lib/utils"

type Tag = {
  id: string
  name: string
  category: string
  sort_order: number
  is_active: boolean
}

// Selection is neutral (dark outline + check) rather than solid brand green:
// the portal keeps colour for the sidebar and primary actions.
const chipBase =
  "inline-flex min-h-11 items-center gap-1.5 border px-3.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-9"

function TagToggleGroup({
  tags,
  selectedTags,
  onToggle,
  featured,
}: {
  tags: Tag[]
  selectedTags: string[]
  onToggle: (id: string) => void
  // Best For only: a star on each selected chip marks it for the cafe card.
  // Replaces a separate "Featured" card that listed the same tags again,
  // unselected, above the section they came from.
  featured?: {
    ids: string[]
    max: number
    onToggle: (id: string) => void
  }
}) {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag.id)
        const isFeatured = !!featured?.ids.includes(tag.id)
        const showStar = !!featured && selected
        const starDisabled =
          !!featured && !isFeatured && featured.ids.length >= featured.max

        return (
          <span key={tag.id} className="inline-flex">
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(tag.id)}
              className={cn(
                chipBase,
                showStar ? "rounded-l-full pr-2.5" : "rounded-full",
                selected
                  ? "border-foreground/70 bg-muted font-medium text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {selected && <Check size={14} weight="bold" aria-hidden="true" />}
              {tag.name}
            </button>
            {showStar && (
              <button
                type="button"
                aria-pressed={isFeatured}
                aria-label={
                  isFeatured
                    ? `Remove ${tag.name} from your cafe card`
                    : `Show ${tag.name} on your cafe card`
                }
                title={
                  starDisabled
                    ? `You can show up to ${featured!.max} on your cafe card`
                    : undefined
                }
                disabled={starDisabled}
                onClick={() => featured!.onToggle(tag.id)}
                className={cn(
                  chipBase,
                  "-ml-px rounded-r-full border-foreground/70 bg-muted px-2.5 disabled:cursor-not-allowed disabled:opacity-40",
                  isFeatured ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Star size={16} weight={isFeatured ? "fill" : "regular"} aria-hidden="true" />
              </button>
            )}
          </span>
        )
      })}
    </div>
  )
}

export function OwnerTagsClient({
  allTags,
  appliedTagIds,
  featuredTagIds,
}: {
  allTags: Tag[]
  appliedTagIds: string[]
  featuredTagIds: string[]
}) {
  const [isDirty, setIsDirty] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [selectedTags, setSelectedTags] = React.useState<string[]>(appliedTagIds)
  const [featuredTags, setFeaturedTags] = React.useState<string[]>(
    featuredTagIds.slice(0, 3)
  )

  // Warn before leaving (refresh / close / browser back) with unsaved edits.
  React.useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const bestForTags = allTags.filter((t) => t.category === "best_for")
  const amenitiesTags = allTags.filter((t) => t.category === "amenities")
  const paymentTags = allTags.filter((t) => t.category === "payment")

  function toggleTag(tagId: string) {
    setSelectedTags((prev) => {
      const next = prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]

      if (!next.includes(tagId)) {
        setFeaturedTags((current) => current.filter((id) => id !== tagId))
      }

      return next
    })
    setIsDirty(true)
  }

  function toggleFeaturedTag(tagId: string) {
    setFeaturedTags((prev) => {
      if (prev.includes(tagId)) return prev.filter((id) => id !== tagId)
      if (prev.length >= 3) return prev
      return [...prev, tagId]
    })
    setIsDirty(true)
  }

  async function handleSave() {
    setIsSaving(true)
    setSaveError(null)
    try {
      const result = await updateTagsAction(selectedTags, featuredTags)
      if (!result.ok) {
        // The AlertDialog below already surfaces this with full context; a
        // toast on top of it would double-report the same failure.
        setSaveError(result.error)
        return
      }
      setIsDirty(false)
      toast.success("Tags saved")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save tags"
      setSaveError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const amenitiesCount = amenitiesTags.filter((t) => selectedTags.includes(t.id)).length
  const paymentCount = paymentTags.filter((t) => selectedTags.includes(t.id)).length

  return (
    <>
      <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold">Tags</h1>
            <p className="text-sm text-muted-foreground">
              Pick everything that fits. People filter by these when they
              search for a cafe.
            </p>
          </div>
        </div>

        {/* Best For */}
        {bestForTags.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Best for</CardTitle>
                  <CardDescription>
                    Why would someone visit your cafe? Star up to 3 to show
                    them on your cafe card.
                  </CardDescription>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                  {featuredTags.length}/3 starred
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <TagToggleGroup
                tags={bestForTags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
                featured={{ ids: featuredTags, max: 3, onToggle: toggleFeaturedTag }}
              />
            </CardContent>
          </Card>
        )}

        {/* Amenities */}
        {amenitiesTags.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>What does your cafe have?</CardDescription>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{amenitiesCount} selected</span>
              </div>
            </CardHeader>
            <CardContent>
              <TagToggleGroup
                tags={amenitiesTags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
              />
            </CardContent>
          </Card>
        )}

        {/* Payment Accepted */}
        {paymentTags.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Payment accepted</CardTitle>
                  <CardDescription>
                    What payment methods do you accept?
                  </CardDescription>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{paymentCount} selected</span>
              </div>
            </CardHeader>
            <CardContent>
              <TagToggleGroup
                tags={paymentTags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
              />
            </CardContent>
          </Card>
        )}

      </div>

      <SaveBar
        visible={isDirty}
        saving={isSaving}
        onSave={handleSave}
        onDiscard={() => {
          setSelectedTags(appliedTagIds)
          setFeaturedTags(featuredTagIds.slice(0, 3))
          setIsDirty(false)
          setSaveError(null)
        }}
      />

      <AlertDialog
        open={saveError !== null}
        onOpenChange={(open) => {
          if (!open) setSaveError(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unable to save tags</AlertDialogTitle>
            <AlertDialogDescription>
              {saveError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* AlertDialog blocks backdrop dismissal and renders no close X, so
              without this the only exit is the Esc key — which phones don't
              have, trapping the owner with unsaved edits. */}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
