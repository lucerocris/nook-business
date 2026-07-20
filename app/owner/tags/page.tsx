import type { Metadata } from "next"
import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getOwnerAssignableTags } from "@/lib/queries/tags"
import { OwnerTagsClient } from "@/components/owner/tags-client"

export const metadata: Metadata = { title: "Tags" }

export default async function OwnerTagsPage() {
  const [cafe, allTags] = await Promise.all([
    getOwnerCafe(),
    getOwnerAssignableTags(),
  ])
  const appliedTags = (cafe.cafe_tags as { tag_id: string; is_featured: boolean }[] | null) ?? []

  // Only seed state with tags the owner can actually see and deselect.
  // `allTags` excludes admin-only specialty tags, so an applied specialty tag
  // would otherwise sit in state invisibly, get posted back on save, and make
  // set_owner_cafe_tags reject the whole update with "Specialty tag can only be
  // assigned by admin" — with no UI to clear it. The RPC re-attaches the cafe's
  // existing specialty tags server-side, so dropping them here is lossless.
  const assignableTagIds = new Set(allTags.map((t) => t.id))
  const ownerVisibleTags = appliedTags.filter((t) => assignableTagIds.has(t.tag_id))

  return (
    <OwnerTagsClient
      allTags={allTags}
      appliedTagIds={ownerVisibleTags.map((t) => t.tag_id)}
      featuredTagIds={ownerVisibleTags.filter((t) => t.is_featured).map((t) => t.tag_id)}
    />
  )
}













