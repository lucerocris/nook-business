"use server"

import { createAdminClient } from "@/lib/supabase/admin"
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

  // Validate the invite BEFORE setting the password. This used to run after,
  // as an unchecked update — so a revoked or expired invite still had its
  // password set and the user was sent to the dashboard (the cafe_owner_cafe
  // row already exists by then), making revocation in nook-admin a no-op.
  const { data: invite } = await supabase
    .from("owner_invites")
    .select("id, status, expires_at")
    .eq("invited_profile_id", user.id)
    .in("status", ["sent", "opened"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; status: string; expires_at: string | null }>()

  if (!invite) {
    return {
      ok: false,
      error: "This invite is no longer valid. Ask the Nook team for a new one.",
    }
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return {
      ok: false,
      error: "This invite has expired. Ask the Nook team for a new one.",
    }
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password })
  if (passwordError) {
    return { ok: false, error: passwordError.message }
  }

  // Both writes use the admin client: RLS may not grant the invitee UPDATE on
  // these rows, and an RLS no-op used to be ignored, returning ok:true with the
  // invite still "sent". Each is scoped strictly to the session user (and their
  // own pending invite), never to a client value, and must affect a row.
  const admin = createAdminClient()

  const { data: acceptedRows, error: inviteError } = await admin
    .from("owner_invites")
    .update({ status: "accepted", used_at: new Date().toISOString() })
    .eq("id", invite.id)
    .eq("invited_profile_id", user.id)
    .in("status", ["sent", "opened"])
    .select("id")

  if (inviteError || !acceptedRows?.length) {
    return {
      ok: false,
      error: "We couldn't finish accepting your invite. Please try again.",
    }
  }

  // The account is active from here; it was created as "invited" by invite-owner.
  const { data: profileRows, error: profileError } = await admin
    .from("profiles")
    .update({ account_status: "active" })
    .eq("id", user.id)
    .select("id")

  if (profileError || !profileRows?.length) {
    return {
      ok: false,
      error: "We couldn't activate your account. Please try again.",
    }
  }

  return { ok: true }
}
