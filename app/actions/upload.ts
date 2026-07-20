"use server"

import { uploadFile, deleteFile, getKeyFromUrl } from "@/lib/upload"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient }      from "@/lib/supabase/server"
import { revalidatePath }    from "next/cache"

const CAFE_PHOTO_LIMIT = 5
const ALLOWED_TYPES    = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_BYTES   = 10 * 1024 * 1024

// Verifies the calling user actually owns `cafeId` before any service-role
// write. Never trust the client-supplied id on its own.
async function requireOwnedCafeId(cafeId: string | undefined): Promise<string> {
  if (!cafeId) throw new Error("cafeId is required")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data } = await supabase
    .from("cafe_owner_cafe")
    .select("cafe_id")
    .eq("owner_id", user.id)
    .eq("cafe_id", cafeId)
    .maybeSingle()

  if (!data) throw new Error("Not authorized for this cafe")
  return data.cafe_id
}

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type))
    throw new Error("Only JPG, PNG, and WEBP are allowed")
  if (file.size > MAX_SIZE_BYTES)
    throw new Error("File must be under 10MB")
}

// ── CAFE HERO PHOTO ───────────────────────────────────
// Key: nook/cafes/{cafeId}/hero.{ext}

export async function uploadCafeHeroAction(
  formData: FormData,
  cafeId: string
) {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")
  validateFile(file)

  const targetCafeId = await requireOwnedCafeId(cafeId)
  const supabase     = createAdminClient()

  // Adding a brand-new hero (none set yet) counts toward the total cap;
  // replacing an existing hero doesn't change the count.
  const { data: cafe } = await supabase
    .from("cafes")
    .select("featured_image_url, photo_urls")
    .eq("id", targetCafeId)
    .single()

  const gallery = (cafe?.photo_urls as string[]) ?? []
  if (!cafe?.featured_image_url && gallery.length >= CAFE_PHOTO_LIMIT) {
    throw new Error(`Maximum ${CAFE_PHOTO_LIMIT} photos per cafe`)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext    = file.type.split("/")[1]
  // Timestamped like the gallery path. A fixed `hero.{ext}` key meant every
  // replacement wrote the same object and produced the same URL, so the CDN
  // (and the browser) kept serving the previous image — replacing a hero
  // looked like it silently did nothing.
  const key    = `nook/cafes/${targetCafeId}/hero-${Date.now()}.${ext}`

  const previousHero = cafe?.featured_image_url as string | null

  const url = await uploadFile({ key, buffer, contentType: file.type })

  const { error } = await supabase
    .from("cafes")
    .update({ featured_image_url: url })
    .eq("id", targetCafeId)

  if (error) throw error

  // Best-effort cleanup of the object we just replaced, after the row points
  // at the new URL. A failure here only leaves an orphan, never a broken card.
  if (previousHero && previousHero !== url) {
    try {
      await deleteFile(getKeyFromUrl(previousHero))
    } catch {
      // ignore — orphaned object, not worth failing the upload over
    }
  }

  revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
  revalidatePath("/owner/photos")

  return { url }
}

// ── CAFE GALLERY PHOTOS ───────────────────────────────
// Key: nook/cafes/{cafeId}/gallery-{timestamp}.{ext}
// Max 5 total (hero + gallery combined)

export async function uploadCafePhotoAction(
  formData: FormData,
  cafeId: string
) {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")
  validateFile(file)

  const targetCafeId = await requireOwnedCafeId(cafeId)
  const supabase     = createAdminClient()

  const { data: cafe } = await supabase
    .from("cafes")
    .select("featured_image_url, photo_urls")
    .eq("id", targetCafeId)
    .single()

  const existing   = (cafe?.photo_urls as string[]) ?? []
  const heroCount  = cafe?.featured_image_url ? 1 : 0
  const totalCount = heroCount + existing.length

  if (totalCount >= CAFE_PHOTO_LIMIT)
    throw new Error(`Maximum ${CAFE_PHOTO_LIMIT} photos per cafe`)

  const buffer    = Buffer.from(await file.arrayBuffer())
  const ext       = file.type.split("/")[1]
  const timestamp = Date.now()
  const key       = `nook/cafes/${targetCafeId}/gallery-${timestamp}.${ext}`

  const url = await uploadFile({ key, buffer, contentType: file.type })

  // No hero yet → promote this upload to hero instead of leaving the listing
  // heroless (cards/map pins/detail header all key off featured_image_url).
  if (!cafe?.featured_image_url) {
    const { error } = await supabase
      .from("cafes")
      .update({ featured_image_url: url })
      .eq("id", targetCafeId)

    if (error) throw error

    revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
    revalidatePath("/owner/photos")

    return { url, total: existing.length + 1 }
  }

  const updated = [...existing, url]
  const { error } = await supabase
    .from("cafes")
    .update({ photo_urls: updated })
    .eq("id", targetCafeId)

  if (error) throw error

  revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
  revalidatePath("/owner/photos")

  return { url, total: heroCount + updated.length }
}

// ── DELETE CAFE PHOTO ─────────────────────────────────

export async function deleteCafePhotoAction(
  photoUrl: string,
  isHero: boolean,
  cafeId: string
) {
  const targetCafeId = await requireOwnedCafeId(cafeId)
  const supabase     = createAdminClient()

  // Load this cafe's own images and confirm the URL belongs to it BEFORE
  // touching storage. Without this, a client could pass any cafe's (public)
  // image URL and delete that object from storage.
  const { data: cafe } = await supabase
    .from("cafes")
    .select("featured_image_url, photo_urls")
    .eq("id", targetCafeId)
    .single()

  const gallery   = (cafe?.photo_urls as string[]) ?? []
  const ownedUrls = new Set<string>([
    ...(cafe?.featured_image_url ? [cafe.featured_image_url] : []),
    ...gallery,
  ])

  if (!ownedUrls.has(photoUrl)) {
    throw new Error("Photo does not belong to this cafe")
  }

  await deleteFile(getKeyFromUrl(photoUrl))

  if (isHero) {
    const newHero    = gallery[0] ?? null
    const newGallery = gallery.slice(1)

    const { error } = await supabase
      .from("cafes")
      .update({ featured_image_url: newHero, photo_urls: newGallery })
      .eq("id", targetCafeId)

    if (error) throw error

  } else {
    const updated = gallery.filter(u => u !== photoUrl)

    const { error } = await supabase
      .from("cafes")
      .update({ photo_urls: updated })
      .eq("id", targetCafeId)

    if (error) throw error
  }

  revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
  revalidatePath("/owner/photos")
}

// ── REORDER CAFE PHOTOS ──────────────────────────────
// Persist the visual order by setting the first URL as hero.

export async function reorderCafePhotosAction(
  orderedPhotoUrls: string[],
  cafeId: string
) {
  const targetCafeId = await requireOwnedCafeId(cafeId)

  if (orderedPhotoUrls.length > CAFE_PHOTO_LIMIT) {
    throw new Error(`Maximum ${CAFE_PHOTO_LIMIT} photos per cafe`)
  }

  const deduped = Array.from(new Set(orderedPhotoUrls.filter(Boolean)))

  const supabase = createAdminClient()

  // Reordering may only permute URLs this cafe already owns. Without this the
  // client could write any URL into the listing — and, because
  // deleteCafePhotoAction validates against whatever is currently stored, a
  // planted URL would then pass that check and let an owner delete another
  // cafe's object from the shared bucket.
  const { data: current } = await supabase
    .from("cafes")
    .select("featured_image_url, photo_urls")
    .eq("id", targetCafeId)
    .single()

  const ownedUrls = new Set<string>([
    ...(current?.featured_image_url ? [current.featured_image_url] : []),
    ...(((current?.photo_urls as string[]) ?? [])),
  ])

  const unknown = deduped.find((url) => !ownedUrls.has(url))
  if (unknown) throw new Error("Photo does not belong to this cafe")

  const hero = deduped[0] ?? null
  const gallery = deduped.slice(1)

  const { error } = await supabase
    .from("cafes")
    .update({
      featured_image_url: hero,
      photo_urls: gallery,
    })
    .eq("id", targetCafeId)

  if (error) throw error

  revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
  revalidatePath("/owner/photos")

  return { hero, gallery }
}

// ── MENU ITEM IMAGE ───────────────────────────────────
// Key: nook/cafes/{cafeId}/menu/{menuItemId}.{ext}

export async function uploadMenuItemImageAction(
  formData: FormData,
  menuItemId: string,
  cafeId: string
) {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")
  validateFile(file)

  const targetCafeId = await requireOwnedCafeId(cafeId)
  const buffer       = Buffer.from(await file.arrayBuffer())
  const ext          = file.type.split("/")[1]
  const key          = `nook/cafes/${targetCafeId}/menu/${menuItemId}.${ext}`

  const url = await uploadFile({ key, buffer, contentType: file.type })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("menu_items")
    .update({ image_url: url })
    .eq("id", menuItemId)
    .eq("cafe_id", targetCafeId)

  if (error) throw error

  revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
  revalidatePath("/owner/menu")

  return { url }
}

// ── DELETE MENU ITEM IMAGE ────────────────────────────

export async function deleteMenuItemImageAction(
  menuItemId: string,
  imageUrl: string,
  cafeId: string
) {
  const targetCafeId = await requireOwnedCafeId(cafeId)
  const supabase     = createAdminClient()

  // Confirm the menu item belongs to this cafe AND the URL matches the stored
  // image before deleting from storage — never delete a client-supplied URL blindly.
  const { data: item } = await supabase
    .from("menu_items")
    .select("id, image_url")
    .eq("id", menuItemId)
    .eq("cafe_id", targetCafeId)
    .maybeSingle()

  if (!item || item.image_url !== imageUrl) {
    throw new Error("Image does not belong to this cafe")
  }

  await deleteFile(getKeyFromUrl(imageUrl))

  const { error } = await supabase
    .from("menu_items")
    .update({ image_url: null })
    .eq("id", menuItemId)
    .eq("cafe_id", targetCafeId)

  if (error) throw error

  revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
  revalidatePath("/owner/menu")
}

// ── REVIEW REPORT EVIDENCE ────────────────────────────
// Key: nook/review-reports/{reviewId}/{timestamp}.{ext}

export async function uploadReviewReportEvidenceAction(
  formData: FormData,
  reviewId: string,
  cafeId: string
) {
  if (!reviewId) throw new Error("reviewId is required")
  const targetCafeId = await requireOwnedCafeId(cafeId)

  const supabase = createAdminClient()
  const { data: review } = await supabase
    .from("reviews")
    .select("id, cafe_id")
    .eq("id", reviewId)
    .eq("cafe_id", targetCafeId)
    .maybeSingle()

  if (!review) throw new Error("Review not found for this cafe")

  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")
  validateFile(file)

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type.split("/")[1]
  const timestamp = Date.now()
  const key = `nook/review-reports/${reviewId}/${timestamp}.${ext}`

  const url = await uploadFile({ key, buffer, contentType: file.type })

  return { url }
}
