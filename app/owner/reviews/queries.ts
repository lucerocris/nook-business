import { createClient } from "@/lib/supabase/server"

export async function getReportedReviewIdsForOwner(
  ownerId: string,
  cafeId: string
): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("review_reports")
    .select("review_id")
    .eq("reporter_id", ownerId)
    .eq("cafe_id", cafeId)
    .eq("reporter_type", "owner")

  if (error) throw error
  return (data ?? [])
    .map((row) => row.review_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0)
}
