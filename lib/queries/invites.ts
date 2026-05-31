import { createAdminClient } from "@/lib/supabase/admin"

export type OwnerInvite = {
  id: string
  cafe_id: string
  invited_profile_id: string | null
  invited_email: string
  status: "sent" | "opened" | "accepted" | "expired" | "revoked" | "failed"
  role: "owner" | "manager"
  expires_at: string | null
  sent_at: string | null
  opened_at: string | null
  used_at: string | null
  resent_at: string | null
  revoked_at: string | null
  created_at: string
}

/**
 * Returns the most recent invite for a given cafe, or null if none exists.
 * Uses the admin client so it works from server components without RLS restrictions.
 */
export async function getInviteForCafe(cafeId: string): Promise<OwnerInvite | null> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("owner_invites")
    .select(
      "id, cafe_id, invited_profile_id, invited_email, status, role, expires_at, sent_at, opened_at, used_at, resent_at, revoked_at, created_at"
    )
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as OwnerInvite | null
}
