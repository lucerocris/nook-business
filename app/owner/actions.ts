"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { updateCafe } from "@/lib/queries/cafes"
import {
  upsertMenuItem,
  deleteMenuItem,
  upsertMenuItemVariants,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from "@/lib/queries/menu"

import { validateAndNormalizeProfile, type ProfileInput } from "@/lib/validation/profile"

export type ProfileResult = { ok: true } | { ok: false; error: string }

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
export async function updateProfileAction(
  input: ProfileInput
): Promise<ProfileResult> {
  const cafeId = await getOwnerCafeId()

  // Validate + normalize server-side (authoritative). This also whitelists the
  // fields that reach updateCafe — status/is_featured/rating can't be smuggled
  // in via extra JSON keys because we only forward the validator's output.
  const result = validateAndNormalizeProfile(input)
  if (!result.ok) return { ok: false, error: result.error }

  try {
    await updateCafe(cafeId, {
      name: result.value.name,
      description: result.value.description,
      operating_hours: result.value.operating_hours,
      social_links: result.value.social_links,
    })
  } catch {
    return { ok: false, error: "Couldn't save your changes. Please try again." }
  }

  revalidatePath("/owner/profile")
  revalidatePath("/owner/dashboard")
  return { ok: true }
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

// ── MENU CATEGORIES ───────────────────────────────────
// createMenuCategory/updateMenuCategory/deleteMenuCategory run as the service
// role, so cafe scoping is enforced here, not by RLS. Custom categories store
// the cafe id in `created_by` (see getCategoriesForCafe).

export type CategoryResult =
  | { ok: true; category: { id: string; name: string } }
  | { ok: false; error: string }

export type DeleteCategoryResult = { ok: true } | { ok: false; error: string }

function validateCategoryName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return "Category name is required"
  if (trimmed.length > 60) return "Category name must be 60 characters or fewer"
  return null
}

// A custom category may only be edited/deleted by the cafe that owns it.
async function assertCategoryOwnedByCafe(id: string, cafeId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("menu_categories")
    .select("id, is_global, created_by")
    .eq("id", id)
    .maybeSingle()

  if (!data || data.is_global || data.created_by !== cafeId) {
    throw new Error("Category not found for this cafe")
  }
}

export async function createCategoryAction(name: string): Promise<CategoryResult> {
  const cafeId = await getOwnerCafeId()
  const err = validateCategoryName(name)
  if (err) return { ok: false, error: err }

  try {
    const category = await createMenuCategory({
      name: name.trim(),
      is_global: false,
      created_by: cafeId,
    })
    revalidatePath("/owner/menu")
    return { ok: true, category: { id: category.id, name: category.name } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create category" }
  }
}

export async function updateCategoryAction(
  id: string,
  name: string
): Promise<CategoryResult> {
  const cafeId = await getOwnerCafeId()
  const err = validateCategoryName(name)
  if (err) return { ok: false, error: err }

  try {
    await assertCategoryOwnedByCafe(id, cafeId)
    const category = await updateMenuCategory({ id, name: name.trim() })
    revalidatePath("/owner/menu")
    return { ok: true, category: { id: category.id, name: category.name } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update category" }
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<DeleteCategoryResult> {
  const cafeId = await getOwnerCafeId()

  try {
    await assertCategoryOwnedByCafe(id, cafeId)
    await deleteMenuCategory(id)
    revalidatePath("/owner/menu")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete category" }
  }
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

export type CorrectionResult = { ok: true } | { ok: false; error: string }

// Emails the Nook team an owner's address/map correction request. Requires
// RESEND_API_KEY and CORRECTION_REQUEST_TO (destination inbox); optionally
// CORRECTION_REQUEST_FROM (a verified Resend sender). Returns a real failure
// instead of silently succeeding when email isn't configured or the send fails.
export async function submitCorrectionRequestAction(
  correction: string
): Promise<CorrectionResult> {
  const trimmed = correction.trim()
  if (!trimmed) return { ok: false, error: "Please describe the correction." }
  if (trimmed.length > 2000) {
    return { ok: false, error: "Please keep the request under 2000 characters." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated" }

  const cafeId = await getOwnerCafeId()

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CORRECTION_REQUEST_TO
  const from = process.env.CORRECTION_REQUEST_FROM ?? "Nook <onboarding@resend.dev>"
  if (!apiKey || !to) {
    return {
      ok: false,
      error: "Correction requests aren't configured yet. Please contact the Nook team directly.",
    }
  }

  // Pull cafe context for the email (service role — read only).
  const admin = createAdminClient()
  const { data: cafe } = await admin
    .from("cafes")
    .select("name, address")
    .eq("id", cafeId)
    .single()

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: user.email ?? undefined,
      subject: `Address correction: ${cafe?.name ?? cafeId}`,
      text: [
        `Cafe: ${cafe?.name ?? "(unknown)"} (${cafeId})`,
        `Current address: ${cafe?.address ?? "(none on file)"}`,
        `Owner: ${user.email ?? user.id}`,
        "",
        "Requested correction:",
        trimmed,
      ].join("\n"),
    })

    if (error) {
      return { ok: false, error: "Couldn't send your request. Please try again." }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: "Couldn't send your request. Please try again." }
  }
}
