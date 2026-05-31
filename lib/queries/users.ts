import { createAdminClient } from "@/lib/supabase/admin"

export async function getUsers() {
  const supabase = createAdminClient()

  const [
    usersResult,
    profilesResult,
    reviewCountsResult,
    favCountsResult,
  ] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, is_suspended, created_at"),
    supabase.from("reviews").select("user_id"),
    supabase.from("user_favorites").select("user_id"),
  ])

  const {
    data: { users },
    error: usersError,
  } = usersResult
  if (usersError) throw usersError

  const { data: profiles, error: profilesError } = profilesResult
  if (profilesError) throw profilesError

  const { data: reviewCounts, error: reviewCountsError } = reviewCountsResult
  if (reviewCountsError) throw reviewCountsError

  const { data: favCounts, error: favCountsError } = favCountsResult
  if (favCountsError) throw favCountsError

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  const reviewCountMap = new Map<string, number>()
  const favoriteCountMap = new Map<string, number>()

  for (const review of reviewCounts ?? []) {
    reviewCountMap.set(review.user_id, (reviewCountMap.get(review.user_id) ?? 0) + 1)
  }

  for (const favorite of favCounts ?? []) {
    favoriteCountMap.set(
      favorite.user_id,
      (favoriteCountMap.get(favorite.user_id) ?? 0) + 1
    )
  }

  const appUsers = users.filter((u) => !u.app_metadata?.role)

  return appUsers.map((user) => {
    const profile = profileMap.get(user.id)
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name ?? null,
      username: profile?.username ?? null,
      avatar_url: profile?.avatar_url ?? null,
      is_suspended: profile?.is_suspended ?? false,
      created_at: user.created_at,
      review_count: reviewCountMap.get(user.id) ?? 0,
      fav_count: favoriteCountMap.get(user.id) ?? 0,
    }
  })
}

export async function suspendUser(userId: string, suspend: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId)

  if (error) throw error
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw error
}
