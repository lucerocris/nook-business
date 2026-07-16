"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Cafe } from "@/lib/queries/cafes"
import { updateCafe } from "@/lib/queries/cafes"
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

// The only cafes columns an owner may write. UpdateProfilePayload's Pick<> is a
// compile-time type and is erased at runtime, while server action arguments are
// attacker-controlled JSON — so the type alone whitelists nothing. Without this,
// updateProfileAction({status:"active", is_featured:true, rating:5}) writes
// straight through updateCafe's service-role client: an owner could publish
// their own draft listing, feature themselves, and invent their own rating.
export async function updateProfileAction(payload: UpdateProfilePayload) {
  const cafeId = await getOwnerCafeId()

  // Copied field by field: whatever else the caller sent is dropped here rather
  // than reaching updateCafe's .update(payload).
  const safePayload: UpdateProfilePayload = {}
  if (payload.name !== undefined) safePayload.name = payload.name
  if (payload.description !== undefined) safePayload.description = payload.description
  if (payload.operating_hours !== undefined) safePayload.operating_hours = payload.operating_hours
  if (payload.social_links !== undefined) safePayload.social_links = payload.social_links

  await updateCafe(cafeId, safePayload)
  revalidatePath("/owner/profile")
  revalidatePath("/owner/dashboard")
}

export type UpdateTagsResult = { ok: true } | { ok: false; error: string }

// Validation, specialty-tag preservation and the delete+insert all live in
// set_owner_cafe_tags now, so this runs as one statement in one transaction.
// It must use the user-context client: the RPC authorizes against auth.uid(),
// which the service-role client does not have.
export async function updateTagsAction(
  tagIds: string[],
  featuredTagIds: string[]
): Promise<UpdateTagsResult> {
  const cafeId = await getOwnerCafeId()
  const supabase = await createClient()

  const { error } = await supabase.rpc("set_owner_cafe_tags", {
    p_cafe_id: cafeId,
    p_tag_ids: tagIds,
    p_featured_tag_ids: featuredTagIds,
  })

  // Rule violations arrive as Postgres errors, not thrown exceptions. Return
  // them as data so the message survives to the client — Next redacts the
  // message of anything thrown from a server action in production.
  if (error) return { ok: false, error: error.message }

  revalidatePath("/owner/tags")
  revalidatePath("/owner/preview")
  revalidatePath("/owner/dashboard")
  return { ok: true }
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
  // Had no authorization at all and reached a service-role delete scoped only
  // by the client-supplied id — any signed-in user could delete any cafe's menu.
  const cafeId = await getOwnerCafeId()
  await deleteMenuItem(id, cafeId)
  revalidatePath("/owner/menu")
}

export async function upsertMenuItemVariantsAction(
  menuItemId: string,
  variants: Parameters<typeof upsertMenuItemVariants>[1]
) {
  // Same shape of hole as deleteMenuItemAction above.
  const cafeId = await getOwnerCafeId()
  const data = await upsertMenuItemVariants(menuItemId, variants, cafeId)
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
