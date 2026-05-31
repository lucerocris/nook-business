import type { Metadata } from "next"
import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getReviewsForCafe } from "@/lib/queries/reviews"
import { OwnerReviewsClient } from "@/components/owner/reviews-client"

export const metadata: Metadata = { title: "Reviews" }

export default async function OwnerReviewsPage() {
  const cafe = await getOwnerCafe()
  const reviews = await getReviewsForCafe(cafe.id)

  return (
    <OwnerReviewsClient
      reviews={reviews}
      cafe={{
        rating: cafe.rating,
        review_count: cafe.review_count,
      }}
    />
  )
}
