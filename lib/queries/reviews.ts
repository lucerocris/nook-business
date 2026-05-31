import { createClient } from "@/lib/supabase/server"

export type Review = {
  id: string
  rating: number
  content: string
  created_at: string
  profiles: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}

export async function getReviewsForCafe(
  cafeId: string,
  options?: { limit?: number }
): Promise<Review[]> {
  const supabase = await createClient()
  let query = supabase
    .from("reviews")
    .select(`
      id, rating, content, created_at,
      profiles!reviews_user_id_fkey ( full_name, username, avatar_url )
    `)
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false })

  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((review) => ({
    ...review,
    profiles: Array.isArray(review.profiles)
      ? (review.profiles[0] ?? null)
      : review.profiles,
  })) as Review[]
}
