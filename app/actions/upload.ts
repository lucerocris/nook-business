"use server"

import { uploadFile, deleteFile, getKeyFromUrl } from "@/lib/upload"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient }      from "@/lib/supabase/server"
import { revalidatePath }    from "next/cache"
import { isUuid }            from "@/lib/validation/uuid"

const CAFE_PHOTO_LIMIT = 5
const ALLOWED_TYPES    = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_BYTES   = 10 * 1024 * 1024

// Errors whose message is safe and useful to show an owner. Next redacts
// thrown Server Action errors in production, so the photo actions below catch
// these and return the message as a value instead of throwing.
class OwnerFacingError extends Error {}

// Verifies the calling user actually owns `cafeId` before any service-role
// write. Never trust the client-supplied id on its own.
async function requireOwnedCafeId(cafeId: string | undefined): Promise<string> {
  if (!cafeId) throw new OwnerFacingError("cafeId is required")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new OwnerFacingError("Your session expired. Log in again to continue.")

  const { data } = await supabase
    .from("cafe_owner_cafe")
    .select("cafe_id")
    .eq("owner_id", user.id)
    .eq("cafe_id", cafeId)
    .maybeSingle()

  if (!data) throw new OwnerFacingError("You don't have access to this cafe")
  return data.cafe_id
}

type ImageType = { contentType: string; ext: string }

// Identify the image from its leading bytes. file.type is whatever the client
// sent, so trusting it let any payload be stored on the CDN as an "image".
function sniffImageType(bytes: Buffer): ImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", ext: "jpeg" }
  }
  const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (bytes.length >= PNG.length && PNG.every((b, i) => bytes[i] === b)) {
    return { contentType: "image/png", ext: "png" }
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { contentType: "image/webp", ext: "webp" }
  }
  return null
}

// Returns the file's bytes plus the Content-Type and extension derived from
// those bytes, never from the client-declared type.
async function readValidatedImage(file: File): Promise<{ buffer: Buffer } & ImageType> {
  if (!ALLOWED_TYPES.includes(file.type))
    throw new OwnerFacingError("Only JPG, PNG, and WEBP photos are allowed")
  if (file.size > MAX_SIZE_BYTES)
    throw new OwnerFacingError("Photo must be under 10MB")

  const buffer = Buffer.from(await file.arrayBuffer())
  const sniffed = sniffImageType(buffer)
  if (!sniffed || !ALLOWED_TYPES.includes(sniffed.contentType))
    throw new OwnerFacingError("Only JPG, PNG, and WEBP photos are allowed")
  return { buffer, ...sniffed }
}

export type CafePhotoState = { hero: string | null; gallery: string[] }
export type CafePhotoResult =
  | ({ ok: true } & CafePhotoState)
  | { ok: false; error: string }

// Every cafe-photo action returns the stored hero + gallery after the write.
// The client replaces its state with this instead of guessing: the server
// can promote an upload to hero or pick a new hero on delete, and a client
// that guessed wrong would later delete or replace the wrong object.
async function runPhotoAction(
  work: () => Promise<CafePhotoState>
): Promise<CafePhotoResult> {
  try {
    return { ok: true, ...(await work()) }
  } catch (error) {
    if (error instanceof OwnerFacingError) {
      return { ok: false, error: error.message }
    }
    console.error("[cafe photos]", error)
    return { ok: false, error: "Something went wrong saving your photos. Please try again." }
  }
}

async function loadPhotos(
  supabase: ReturnType<typeof createAdminClient>,
  cafeId: string
): Promise<CafePhotoState> {
  const { data, error } = await supabase
    .from("cafes")
    .select("featured_image_url, photo_urls")
    .eq("id", cafeId)
    .single()
  if (error) throw error
  return {
    hero: (data?.featured_image_url as string | null) ?? null,
    gallery: (data?.photo_urls as string[] | null) ?? [],
  }
}

async function deleteFileQuietly(url: string) {
  try {
    await deleteFile(getKeyFromUrl(url))
  } catch (error) {
    // An orphaned object costs a few KB; failing the owner's action over it
    // (or leaving the row pointing at a deleted file) costs a broken listing.
    console.error("[cafe photos] storage cleanup failed", url, error)
  }
}

function revalidatePhotos(cafeId: string) {
  revalidatePath(`/admin/cafes/${cafeId}/edit`)
  revalidatePath("/owner/photos")
  revalidatePath("/owner/dashboard")
}

function tooMany(): never {
  throw new OwnerFacingError(
    `You can have up to ${CAFE_PHOTO_LIMIT} photos. Delete one to add another.`
  )
}

// ── CAFE HERO PHOTO ───────────────────────────────────
// Key: nook/cafes/{cafeId}/hero-{timestamp}.{ext}

export async function uploadCafeHeroAction(
  formData: FormData,
  cafeId: string
): Promise<CafePhotoResult> {
  return runPhotoAction(async () => {
    const file = formData.get("file") as File | null
    if (!file) throw new OwnerFacingError("Choose a photo to upload")
    const { buffer, contentType, ext } = await readValidatedImage(file)

    const targetCafeId = await requireOwnedCafeId(cafeId)
    const supabase     = createAdminClient()
    const current      = await loadPhotos(supabase, targetCafeId)

    // A brand-new hero counts toward the cap; replacing one doesn't.
    if (!current.hero && current.gallery.length >= CAFE_PHOTO_LIMIT) tooMany()

    // Timestamped: a fixed key produced the same URL on every replacement, so
    // the CDN kept serving the old image.
    const key    = `nook/cafes/${targetCafeId}/hero-${Date.now()}.${ext}`
    const url    = await uploadFile({ key, buffer, contentType })

    const { error } = await supabase
      .from("cafes")
      .update({ featured_image_url: url })
      .eq("id", targetCafeId)
    if (error) throw error

    // Clean up the replaced object only after the row points at the new one.
    if (current.hero && current.hero !== url) await deleteFileQuietly(current.hero)

    revalidatePhotos(targetCafeId)
    return { hero: url, gallery: current.gallery }
  })
}

// ── CAFE GALLERY PHOTOS ───────────────────────────────
// Key: nook/cafes/{cafeId}/gallery-{timestamp}.{ext}
// Max 5 total (hero + gallery combined)

export async function uploadCafePhotoAction(
  formData: FormData,
  cafeId: string
): Promise<CafePhotoResult> {
  return runPhotoAction(async () => {
    const file = formData.get("file") as File | null
    if (!file) throw new OwnerFacingError("Choose a photo to upload")
    const { buffer, contentType, ext } = await readValidatedImage(file)

    const targetCafeId = await requireOwnedCafeId(cafeId)
    const supabase     = createAdminClient()
    const current      = await loadPhotos(supabase, targetCafeId)

    if ((current.hero ? 1 : 0) + current.gallery.length >= CAFE_PHOTO_LIMIT) tooMany()

    const key    = `nook/cafes/${targetCafeId}/gallery-${Date.now()}.${ext}`
    const url    = await uploadFile({ key, buffer, contentType })

    // No hero yet → this upload becomes the hero (cards, map pins and the
    // detail header all key off featured_image_url).
    const next: CafePhotoState = current.hero
      ? { hero: current.hero, gallery: [...current.gallery, url] }
      : { hero: url, gallery: current.gallery }

    const { error } = await supabase
      .from("cafes")
      .update({ featured_image_url: next.hero, photo_urls: next.gallery })
      .eq("id", targetCafeId)
    if (error) throw error

    revalidatePhotos(targetCafeId)
    return next
  })
}

// ── DELETE CAFE PHOTO ─────────────────────────────────

export async function deleteCafePhotoAction(
  photoUrl: string,
  cafeId: string
): Promise<CafePhotoResult> {
  return runPhotoAction(async () => {
    const targetCafeId = await requireOwnedCafeId(cafeId)
    const supabase     = createAdminClient()
    const current      = await loadPhotos(supabase, targetCafeId)

    // Only URLs stored on this cafe may be deleted. Without this, a client
    // could pass any cafe's public image URL and delete it from storage.
    const isHero = current.hero === photoUrl
    if (!isHero && !current.gallery.includes(photoUrl)) {
      throw new OwnerFacingError("That photo is no longer on your listing. Refresh the page.")
    }

    // Hero-ness comes from the row, never from the client: a client that
    // thought a promoted hero was a gallery photo used to leave
    // featured_image_url pointing at a deleted object.
    const gallery = current.gallery.filter((u) => u !== photoUrl)
    const next: CafePhotoState = isHero
      ? { hero: gallery[0] ?? null, gallery: gallery.slice(1) }
      : { hero: current.hero, gallery }

    // Row first, storage second: a failed DB write must not leave the
    // listing pointing at an object that's already gone.
    const { error } = await supabase
      .from("cafes")
      .update({ featured_image_url: next.hero, photo_urls: next.gallery })
      .eq("id", targetCafeId)
    if (error) throw error

    await deleteFileQuietly(photoUrl)

    revalidatePhotos(targetCafeId)
    return next
  })
}

// ── REORDER CAFE PHOTOS ──────────────────────────────
// Persist the visual order by setting the first URL as hero.

export async function reorderCafePhotosAction(
  orderedPhotoUrls: string[],
  cafeId: string
): Promise<CafePhotoResult> {
  return runPhotoAction(async () => {
    const targetCafeId = await requireOwnedCafeId(cafeId)
    if (orderedPhotoUrls.length > CAFE_PHOTO_LIMIT) tooMany()

    const deduped  = Array.from(new Set(orderedPhotoUrls.filter(Boolean)))
    const supabase = createAdminClient()
    const current  = await loadPhotos(supabase, targetCafeId)

    // Reordering may only permute URLs this cafe already owns, and all of
    // them: planting a foreign URL would let a later delete remove another
    // cafe's object, and dropping one would orphan it.
    const owned = [...(current.hero ? [current.hero] : []), ...current.gallery]
    const sameSet =
      deduped.length === owned.length && deduped.every((u) => owned.includes(u))
    if (!sameSet) {
      throw new OwnerFacingError("Your photos changed in another tab. Refresh the page and try again.")
    }

    const next: CafePhotoState = { hero: deduped[0] ?? null, gallery: deduped.slice(1) }
    const { error } = await supabase
      .from("cafes")
      .update({ featured_image_url: next.hero, photo_urls: next.gallery })
      .eq("id", targetCafeId)
    if (error) throw error

    revalidatePhotos(targetCafeId)
    return next
  })
}

// ── MENU ITEM IMAGE ───────────────────────────────────
// Key: nook/cafes/{cafeId}/menu/{menuItemId}-{timestamp}.{ext}
// Returns errors as values for the same reason as the photo actions above.

export type MenuImageResult =
  | { ok: true; url: string | null }
  | { ok: false; error: string }

async function runMenuImageAction(
  work: () => Promise<string | null>
): Promise<MenuImageResult> {
  try {
    return { ok: true, url: await work() }
  } catch (error) {
    if (error instanceof OwnerFacingError) return { ok: false, error: error.message }
    console.error("[menu image]", error)
    return { ok: false, error: "Something went wrong with that image. Please try again." }
  }
}

export async function uploadMenuItemImageAction(
  formData: FormData,
  menuItemId: string,
  cafeId: string
): Promise<MenuImageResult> {
  return runMenuImageAction(async () => {
    const file = formData.get("file") as File | null
    if (!file) throw new OwnerFacingError("Choose a photo to upload")
    const { buffer, contentType, ext } = await readValidatedImage(file)

    const targetCafeId = await requireOwnedCafeId(cafeId)
    const supabase     = createAdminClient()

    // menuItemId is client-supplied and lands in the storage key, so check it
    // is a real item on this cafe BEFORE uploading anything.
    if (!isUuid(menuItemId)) throw new OwnerFacingError("That menu item no longer exists. Refresh the page.")
    const { data: item, error: itemError } = await supabase
      .from("menu_items")
      .select("id")
      .eq("id", menuItemId)
      .eq("cafe_id", targetCafeId)
      .maybeSingle()
    if (itemError) throw itemError
    if (!item) throw new OwnerFacingError("That menu item no longer exists. Refresh the page.")

    // Timestamped: compression always yields .webp, so a fixed per-item key
    // gave a replacement the same URL and the CDN kept serving the old photo.
    const key          = `nook/cafes/${targetCafeId}/menu/${menuItemId}-${Date.now()}.${ext}`

    const url = await uploadFile({ key, buffer, contentType })

    const { data: updated, error } = await supabase
      .from("menu_items")
      .update({ image_url: url })
      .eq("id", menuItemId)
      .eq("cafe_id", targetCafeId)
      .select("id")
    if (error || !updated?.length) {
      // The item vanished between the check and the write; don't orphan the upload.
      await deleteFileQuietly(url)
      if (error) throw error
      throw new OwnerFacingError("That menu item no longer exists. Refresh the page.")
    }

    revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
    revalidatePath("/owner/menu")
    return url
  })
}

// ── DELETE MENU ITEM IMAGE ────────────────────────────

export async function deleteMenuItemImageAction(
  menuItemId: string,
  imageUrl: string,
  cafeId: string
): Promise<MenuImageResult> {
  return runMenuImageAction(async () => {
    const targetCafeId = await requireOwnedCafeId(cafeId)
    const supabase     = createAdminClient()

    // Confirm the item belongs to this cafe AND the URL matches the stored
    // image before touching storage; never delete a client-supplied URL blindly.
    const { data: item } = await supabase
      .from("menu_items")
      .select("id, image_url")
      .eq("id", menuItemId)
      .eq("cafe_id", targetCafeId)
      .maybeSingle()

    if (!item || item.image_url !== imageUrl) {
      throw new OwnerFacingError("That image is no longer on this item. Refresh the page.")
    }

    // Row first, then storage, as with cafe photos.
    const { error } = await supabase
      .from("menu_items")
      .update({ image_url: null })
      .eq("id", menuItemId)
      .eq("cafe_id", targetCafeId)
    if (error) throw error

    await deleteFileQuietly(imageUrl)

    revalidatePath(`/admin/cafes/${targetCafeId}/edit`)
    revalidatePath("/owner/menu")
    return null
  })
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
  const { buffer, contentType, ext } = await readValidatedImage(file)

  const timestamp = Date.now()
  const key = `nook/review-reports/${reviewId}/${timestamp}.${ext}`

  const url = await uploadFile({ key, buffer, contentType })

  return { url }
}
