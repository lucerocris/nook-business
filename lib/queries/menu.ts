import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type Category = {
  id: string
  name: string
  is_global: boolean
  created_by: string | null
}

export type MenuItem = {
  id: string
  name: string
  description?: string | null
  price: number
  is_highlight: boolean
  image_url: string | null
  category_id: string
  menu_categories: { id: string; name: string } | null
  menu_item_variants?: MenuItemVariant[] | null
}

export type MenuItemVariant = {
  id: string
  label: string
  price_override: number | null
  price_modifier: number
  is_default: boolean
  sort_order: number
}

export async function getCategoriesForCafe(cafeId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .or(`is_global.eq.true,created_by.eq.${cafeId}`)
    .order("is_global", { ascending: false })

  if (error) throw error
  return (data ?? []) as Category[]
}

export async function getGlobalCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("is_global", true)
    .order("name", { ascending: true })

  if (error) throw error
  return (data ?? []) as Category[]
}

// Every write below runs as the service role, so RLS will not scope it — the
// explicit cafe_id equality IS the authorization check. cafeId must always be
// derived from the session (getOwnerCafeId), never accepted from the client.

// Confirms a menu item belongs to the given cafe. Needed wherever the item id
// comes from the client but the row cannot be scoped by cafe_id in-statement.
async function assertMenuItemBelongsToCafe(
  supabase: ReturnType<typeof createAdminClient>,
  menuItemId: string,
  cafeId: string
) {
  const { data } = await supabase
    .from("menu_items")
    .select("id")
    .eq("id", menuItemId)
    .eq("cafe_id", cafeId)
    .maybeSingle()

  if (!data) throw new Error("Not authorized for this menu item")
}

// Accepts only images hosted on our own Spaces bucket. Historically rows were
// written with both the CDN hostname and the bare origin hostname
// (…sgp1.cdn.digitaloceanspaces.com and …sgp1.digitaloceanspaces.com), so both
// are allowed; anything else is treated as untrusted.
function isOwnedImageUrl(url: string): boolean {
  const cdn = process.env.DO_SPACES_CDN_URL
  if (!cdn) return false
  try {
    const host = new URL(url).host
    const cdnHost = new URL(cdn).host
    return host === cdnHost || host === cdnHost.replace(".cdn.", ".")
  } catch {
    return false
  }
}

export async function upsertMenuItem(item: {
  id?: string
  cafe_id: string
  name: string
  description?: string | null
  price: number
  category_id: string
  is_highlight: boolean
  image_url?: string | null
}) {
  const supabase = createAdminClient()

  // Server-side backstop for input the client should already have validated.
  if (!item.name?.trim()) {
    throw new Error("Item name is required")
  }
  if (!Number.isFinite(item.price) || item.price < 0) {
    throw new Error("Price must be a valid amount of 0 or more")
  }

  // On update, the row must already belong to this cafe. Without this, passing
  // another cafe's menu_items.id would reassign that item to the caller's cafe.
  if (item.id) {
    await assertMenuItemBelongsToCafe(supabase, item.id, item.cafe_id)
  }

  // Enforce the 5-highlight cap on the server too (the client also enforces it,
  // but two tabs / non-UI callers could otherwise exceed it).
  if (item.is_highlight) {
    const { count } = await supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("cafe_id", item.cafe_id)
      .eq("is_highlight", true)
      .neq("id", item.id ?? "00000000-0000-0000-0000-000000000000")

    if ((count ?? 0) >= 5) {
      throw new Error("You can feature up to 5 highlights only")
    }
  }

  // Build the payload explicitly rather than spreading the caller's object.
  // `upsert(item)` wrote through every key it was handed, so a non-UI caller
  // could set any writable column on the row.
  const payload: Record<string, unknown> = {
    cafe_id:      item.cafe_id,
    name:         item.name.trim(),
    description:  item.description ?? null,
    price:        item.price,
    category_id:  item.category_id,
    is_highlight: item.is_highlight,
  }
  if (item.id) payload.id = item.id

  // image_url is only ever produced by uploadMenuItemImageAction. Accepting it
  // verbatim let an arbitrary external image be attached to a public listing,
  // so restrict it to our own Spaces bucket. Note both the CDN host and the
  // origin host are in use on existing rows, so accept either.
  if (item.image_url !== undefined) {
    if (item.image_url === null) {
      payload.image_url = null
    } else if (isOwnedImageUrl(item.image_url)) {
      payload.image_url = item.image_url
    } else {
      throw new Error("Invalid menu item image")
    }
  }

  const { data, error } = await supabase
    .from("menu_items")
    .upsert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMenuItem(id: string, cafeId: string) {
  const supabase = createAdminClient()

  // Scoped by cafe_id as well as id, so the delete cannot touch another cafe's
  // row. Returning the deleted ids lets us tell "not yours" from "not found".
  const { data, error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id)
    .eq("cafe_id", cafeId)
    .select("id")

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error("Not authorized for this menu item")
  }
}

export async function upsertMenuItemVariants(
  menuItemId: string,
  variants: Array<Omit<MenuItemVariant, "id"> & { id?: string }>,
  cafeId: string
) {
  const supabase = createAdminClient()

  // menu_item_variants has no cafe_id, so ownership is checked against the
  // parent item before the delete+insert.
  await assertMenuItemBelongsToCafe(supabase, menuItemId, cafeId)

  const { error: deleteError } = await supabase
    .from("menu_item_variants")
    .delete()
    .eq("menu_item_id", menuItemId)

  if (deleteError) throw deleteError

  if (variants.length === 0) return []

  // Use insert only (omit id). Batch upsert from PostgREST can send id = null,
  // which skips DEFAULT gen_random_uuid() and violates NOT NULL on id.
  const payload = variants.map((variant, index) => ({
    menu_item_id: menuItemId,
    label: variant.label,
    price_override: variant.price_override,
    price_modifier: variant.price_modifier ?? 0,
    is_default: variant.is_default ?? false,
    sort_order: variant.sort_order ?? index,
  }))

  const { data, error } = await supabase
    .from("menu_item_variants")
    .insert(payload)
    .select()

  if (error) throw error
  return data as MenuItemVariant[]
}

export async function createMenuCategory(category: {
  name: string
  is_global: boolean
  created_by: string | null
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("menu_categories")
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function updateMenuCategory(category: {
  id: string
  name: string
}): Promise<Category> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("menu_categories")
    .update({ name: category.name })
    .eq("id", category.id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function assignDraftCategoriesToCafe(
  cafeId: string,
  categoryIds: string[]
) {
  if (categoryIds.length === 0) return

  const uniqueIds = Array.from(new Set(categoryIds))
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("menu_categories")
    .update({ created_by: cafeId })
    .in("id", uniqueIds)
    .eq("is_global", false)
    .is("created_by", null)

  if (error) throw error
}

export async function deleteMenuCategory(id: string): Promise<void> {
  const supabase = createAdminClient()

  const { count } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)

  if (count && count > 0) {
    throw new Error(
      `Cannot delete - ${count} menu item${count > 1 ? "s" : ""} use this category. Reassign them first.`
    )
  }

  const { data: category } = await supabase
    .from("menu_categories")
    .select("is_global")
    .eq("id", id)
    .single()

  if (category?.is_global) {
    throw new Error(
      "Cannot delete a global category. Contact the Nook team to remove global categories."
    )
  }

  const { error } = await supabase.from("menu_categories").delete().eq("id", id)

  if (error) throw error
}
