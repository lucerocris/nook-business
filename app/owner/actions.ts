"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Cafe } from "@/lib/queries/cafes"
import { updateCafe } from "@/lib/queries/cafes"
import { isSpecialtyTag, setCafeTags } from "@/lib/queries/tags"
import {
  upsertMenuItem,
  deleteMenuItem,
  upsertMenuItemVariants,
} from "@/lib/queries/menu"

type UpdateProfilePayload = Partial<Pick<
  Cafe,
  "name" | "description" | "operating_hours" | "social_links"
>>

async function getOwnerCafeId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data } = await supabase
    .from("cafe_owner_cafe")
    .select("cafe_id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!data) throw new Error("No cafe linked to this owner")
  return data.cafe_id
}

export async function updateProfileAction(payload: UpdateProfilePayload) {
  const cafeId = await getOwnerCafeId()
  await updateCafe(cafeId, payload)
  revalidatePath("/owner/profile")
  revalidatePath("/owner/dashboard")
}

export async function updateTagsAction(
  tagIds: string[],
  featuredTagIds: string[]
) {
  const cafeId = await getOwnerCafeId()
  const supabase = createAdminClient()

  const normalizedTagIds = Array.from(new Set(tagIds))
  const normalizedFeaturedTagIds = Array.from(new Set(featuredTagIds))

  if (normalizedFeaturedTagIds.length > 3) {
    throw new Error("You can select up to 3 featured tags only")
  }

  const featuredMustBeSelected = normalizedFeaturedTagIds.every((tagId) =>
    normalizedTagIds.includes(tagId)
  )
  if (!featuredMustBeSelected) {
    throw new Error("Featured tags must be included in selected tags")
  }

  const requestedTagIds = Array.from(
    new Set([...normalizedTagIds, ...normalizedFeaturedTagIds])
  )

  if (requestedTagIds.length > 0) {
    const { data: requestedTags, error } = await supabase
      .from("tags")
      .select("id, name, category")
      .in("id", requestedTagIds)

    if (error) throw error

    if ((requestedTags ?? []).length !== requestedTagIds.length) {
      throw new Error("One or more selected tags are invalid")
    }

    const hasSpecialtyTag = (requestedTags ?? []).some((tag) =>
      isSpecialtyTag(tag)
    )

    if (hasSpecialtyTag) {
      throw new Error("Specialty tag can only be assigned by admin")
    }
  }

  if (normalizedFeaturedTagIds.length > 0) {
    const { data: bestForTags, error } = await supabase
      .from("tags")
      .select("id")
      .eq("category", "best_for")
      .in("id", normalizedFeaturedTagIds)

    if (error) throw error

    if ((bestForTags ?? []).length !== normalizedFeaturedTagIds.length) {
      throw new Error("Featured tags must come from Best For tags")
    }
  }

  const { data: existingCafeTags, error: existingCafeTagsError } = await supabase
    .from("cafe_tags")
    .select("tag_id, is_featured, tags!inner(name, category)")
    .eq("cafe_id", cafeId)

  if (existingCafeTagsError) throw existingCafeTagsError

  const preservedSpecialtyTags = (existingCafeTags ?? []).filter((row) => {
    const joinedTag = Array.isArray(row.tags) ? row.tags[0] : row.tags
    return joinedTag ? isSpecialtyTag(joinedTag) : false
  })

  const mergedTagIds = Array.from(
    new Set([...normalizedTagIds, ...preservedSpecialtyTags.map((row) => row.tag_id)])
  )

  const mergedFeaturedTagIds = Array.from(
    new Set([
      ...normalizedFeaturedTagIds,
      ...preservedSpecialtyTags
        .filter((row) => row.is_featured)
        .map((row) => row.tag_id),
    ])
  )

  await setCafeTags(cafeId, mergedTagIds, mergedFeaturedTagIds)
  revalidatePath("/owner/tags")
}

export async function upsertMenuItemAction(
  item: Omit<Parameters<typeof upsertMenuItem>[0], "cafe_id">
) {
  const cafeId = await getOwnerCafeId()
  const data = await upsertMenuItem({ ...item, cafe_id: cafeId })
  revalidatePath("/owner/menu")
  return { id: data.id as string }
}

export async function deleteMenuItemAction(id: string) {
  await deleteMenuItem(id)
  revalidatePath("/owner/menu")
}

export async function upsertMenuItemVariantsAction(
  menuItemId: string,
  variants: Parameters<typeof upsertMenuItemVariants>[1]
) {
  const data = await upsertMenuItemVariants(menuItemId, variants)
  revalidatePath("/owner/menu")
  return data
}

export async function updatePhotoAction(url: string, isHero: boolean) {
  const cafeId = await getOwnerCafeId()
  if (isHero) {
    await updateCafe(cafeId, { featured_image_url: url })
  } else {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("cafes")
      .select("photo_urls")
      .eq("id", cafeId)
      .single()
    const existing = (data?.photo_urls as string[]) ?? []
    await updateCafe(cafeId, { photo_urls: [...existing, url] })
  }
  revalidatePath("/owner/photos")
}

export async function submitCorrectionRequestAction(correction: string) {
  console.log("Correction request:", correction)
  // TODO: Send via Resend email to team
  revalidatePath("/owner/profile")
}
