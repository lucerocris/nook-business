"use client"

import * as React from "react"
import { Check, FloppyDisk, Star } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"
import { updateTagsAction } from "@/app/owner/actions"

type Tag = {
  id: string
  name: string
  category: string
  sort_order: number
  is_active: boolean
}

function TagToggleGroup({
  tags,
  selectedTags,
  onToggle,
}: {
  tags: Tag[]
  selectedTags: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag.id)
        return (
          <Button
            key={tag.id}
            variant={selected ? "default" : "outline"}
            size="sm"
            onClick={() => onToggle(tag.id)}
            className={selected ? "gap-1.5" : "gap-1.5 text-muted-foreground"}
          >
            {selected && <Check size={12} />}
            {tag.name}
          </Button>
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
      await updateTagsAction(selectedTags, featuredTags)
      setIsDirty(false)
      toast.success("Tags saved")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save tags"
      setSaveError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const featuredCandidates = bestForTags.filter((t) => selectedTags.includes(t.id))
  const bestForCount = bestForTags.filter((t) => selectedTags.includes(t.id)).length
  const amenitiesCount = amenitiesTags.filter((t) => selectedTags.includes(t.id)).length
  const paymentCount = paymentTags.filter((t) => selectedTags.includes(t.id)).length

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold">Tags</h1>
            <p className="text-sm text-muted-foreground">
              Select all tags that apply to your cafe. Tags help users discover
              you in search and filters.
            </p>
          </div>
        </div>

        {/* Featured Tag Card */}
        <Card>
          <CardHeader>
            <CardTitle>Featured tags</CardTitle>
            <CardDescription>
              Select up to 3 featured tags from Best For. These appear as the
              primary labels on your cafe card.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredCandidates.length > 0 ? (
              <div className="flex flex-row flex-wrap gap-2">
                {featuredCandidates.map((tag) => {
                  const selected = featuredTags.includes(tag.id)
                  const atLimit = featuredTags.length >= 3 && !selected

                  return (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      className={selected ? "gap-1.5" : "gap-1.5 text-muted-foreground"}
                      onClick={() => toggleFeaturedTag(tag.id)}
                      disabled={atLimit}
                    >
                      {selected && <Star size={12} weight="fill" />}
                      {tag.name}
                    </Button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select at least one Best For tag first to choose featured tags.
              </p>
            )}

            <div className="text-xs text-muted-foreground">
              {featuredTags.length}/3 featured selected
            </div>

            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <Star size={14} className="text-yellow-500 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Featured tags must be from Best For and can include up to 3
                tags.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Best For */}
        {bestForTags.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Best For</CardTitle>
                  <CardDescription>
                    Why would someone visit your cafe?
                  </CardDescription>
                </div>
                <Badge variant="secondary">{bestForCount} selected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TagToggleGroup
                tags={bestForTags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
              />
            </CardContent>
          </Card>
        )}

        {/* Amenities */}
        {amenitiesTags.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>What does your cafe have?</CardDescription>
                </div>
                <Badge variant="secondary">{amenitiesCount} selected</Badge>
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
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Payment Accepted</CardTitle>
                  <CardDescription>
                    What payment methods do you accept?
                  </CardDescription>
                </div>
                <Badge variant="secondary">{paymentCount} selected</Badge>
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

        {isDirty && <div className="h-20" />}
      </div>

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between z-50">
          <p className="text-sm text-muted-foreground">
            You have unsaved changes
          </p>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setSelectedTags(appliedTagIds)
                setFeaturedTags(featuredTagIds.slice(0, 3))
                setIsDirty(false)
                setSaveError(null)
              }}
            >
              Discard
            </Button>
            <Button
              variant="default"
              className="flex-1 sm:flex-none"
              onClick={handleSave}
              disabled={isSaving}
            >
              <FloppyDisk className="size-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

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
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
