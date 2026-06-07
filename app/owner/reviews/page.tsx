import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getReviewsForCafe } from "@/lib/queries/reviews"
import { getReportedReviewIdsForOwner } from "@/app/owner/reviews/queries"
import { OwnerReviewsClient } from "@/components/owner/reviews-client"

export const metadata: Metadata = { title: "Reviews" }

export default async function OwnerReviewsPage() {
  const cafe = await getOwnerCafe()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const ownerId = user?.id ?? null

  const [reviews, reportedReviewIds] = await Promise.all([
    getReviewsForCafe(cafe.id),
    ownerId
      ? getReportedReviewIdsForOwner(ownerId, cafe.id).catch(() => [])
      : Promise.resolve<string[]>([]),
  ])

  return (
    <OwnerReviewsClient
      reviews={reviews}
      cafe={{
        id: cafe.id,
        rating: cafe.rating,
        review_count: cafe.review_count,
      }}
      reportedReviewIds={reportedReviewIds}
    />
  )
}
