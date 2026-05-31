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

  return (
    <OwnerTagsClient
      allTags={allTags}
      appliedTagIds={appliedTags.map((t) => t.tag_id)}
      featuredTagIds={appliedTags.filter((t) => t.is_featured).map((t) => t.tag_id)}
    />
  )
}













