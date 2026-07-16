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

export async function updateProfileAction(payload: UpdateProfilePayload) {
  const cafeId = await getOwnerCafeId()
  await updateCafe(cafeId, payload)
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
