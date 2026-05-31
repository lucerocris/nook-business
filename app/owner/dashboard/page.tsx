import type { Metadata } from "next"
import { getOwnerCafeContext } from "@/lib/owner/get-owner-cafe"
import { getOwnerAnalyticsSummaries, getOwnerDashboardCafeById } from "@/lib/queries/cafes" 
import { getReviewsForCafe } from "@/lib/queries/reviews"
import { OwnerDashboardClient } from "@/components/owner/dashboard-client"

export const metadata: Metadata = { title: "Dashboard" }

export default async function OwnerDashboardPage() {
  const { cafeId } = await getOwnerCafeContext()
  
  const [cafe, reviews, analyticsData] = await Promise.all([
    getOwnerDashboardCafeById(cafeId),
    getReviewsForCafe(cafeId, { limit: 5 }),
    getOwnerAnalyticsSummaries(cafeId, 30), 
  ])

  return (
  <OwnerDashboardClient
    cafe={cafe}
    recentReviews={reviews}
    analytics={analyticsData.totals}
  />
)
}