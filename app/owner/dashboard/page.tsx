import type { Metadata } from "next"
import { getOwnerCafeContext } from "@/lib/owner/get-owner-cafe"
import { getOwnerAnalyticsSummaries, getOwnerDashboardCafeById } from "@/lib/queries/cafes"
import { getReviewsForCafe } from "@/lib/queries/reviews"
import { createClient } from "@/lib/supabase/server"
import { OwnerDashboardClient } from "@/components/owner/dashboard-client"
import { TRAFFIC_RANGES } from "@/lib/owner/traffic-ranges"

export const metadata: Metadata = { title: "Dashboard" }

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams
  const days = TRAFFIC_RANGES.find((r) => String(r) === range) ?? 30

  const { cafeId } = await getOwnerCafeContext()
  const supabase = await createClient()

  const [cafe, reviews, analyticsData, { data: { user } }] = await Promise.all([
    getOwnerDashboardCafeById(cafeId),
    getReviewsForCafe(cafeId, { limit: 5 }),
    getOwnerAnalyticsSummaries(cafeId, days),
    supabase.auth.getUser(),
  ])

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? null

  return (
    <OwnerDashboardClient
      cafe={cafe}
      recentReviews={reviews}
      analytics={analyticsData}
      days={days}
      firstName={fullName?.trim().split(/\s+/)[0] ?? null}
    />
  )
}
