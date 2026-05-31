import type { Metadata } from "next"
import { getOwnerCafeContext } from "@/lib/owner/get-owner-cafe"
import { getOwnerPhotosCafeById } from "@/lib/queries/cafes"
import { OwnerPhotosClient } from "@/components/owner/photos-client"

export const metadata: Metadata = { title: "Photos" }

export default async function OwnerPhotosPage() {
  const { cafeId } = await getOwnerCafeContext()
  const cafe = await getOwnerPhotosCafeById(cafeId)

  return (
    <OwnerPhotosClient
      heroUrl={cafe.featured_image_url}
      photoUrls={cafe.photo_urls}
      cafeId={cafe.id}
    />
  )
}
