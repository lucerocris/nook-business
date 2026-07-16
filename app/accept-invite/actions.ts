"use server"

import { createClient } from "@/lib/supabase/server"

export type AcceptInviteResult = { ok: true } | { ok: false; error: string }

const MIN_PASSWORD_LENGTH = 8

/**
 * Completes an owner invite: sets the account password and marks the invite
 * accepted.
 *
 * Nothing previously moved owner_invites.status off "sent" — the two "accepted"
 * rows in production were set by hand — so the admin invite list could never
 * reflect reality. Status is updated here, scoped to the caller's own invite.
 *
 * Authorization comes from the session established by /accept-invite exchanging
 * the emailed code; there is nothing else to check, and no id is accepted from
 * the client.
 */
export async function acceptInviteAction(
  password: string
): Promise<AcceptInviteResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Your invite link has expired. Ask for a new one." }
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    }
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password })
  if (passwordError) {
    return { ok: false, error: passwordError.message }
  }

  // Scoped to this user's own pending invite. RLS applies (user-context client),
  // and invited_profile_id is compared against the session, not a client value.
  await supabase
    .from("owner_invites")
    .update({ status: "accepted", used_at: new Date().toISOString() })
    .eq("invited_profile_id", user.id)
    .in("status", ["sent", "opened"])

  // The account is active from here; it was created as "invited" by invite-owner.
  await supabase
    .from("profiles")
    .update({ account_status: "active" })
    .eq("id", user.id)

  return { ok: true }
}
