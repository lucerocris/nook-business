import { createAdminClient } from "@/lib/supabase/admin"

// Where new-claim alerts land. Env-overridable so this isn't welded to one inbox.
const DEFAULT_TO = "lucerocris22@gmail.com"
// Verified Resend sender on the Nook domain, matching nook-admin. Sending from
// nookph.app keeps the From domain aligned with the brand and the links in the
// body; the old surgestudio.tech address mismatched both and tripped spam filters.
const DEFAULT_FROM = "Nook <noreply@nookph.app>"

export type NewClaimNotification = {
  claimId: string
  cafeId: string
  claimantId: string
  claimantEmail: string | null
  role: "owner" | "manager"
  verificationCode: string | null
}

// Cafe names, addresses and profile names are user-supplied, so they must be
// escaped before going into the HTML part.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export type NotifyResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string }

// Best-effort ops alert. The claim row is already committed by the time this
// runs, so every failure path logs and returns a result instead of throwing —
// a dropped notification must never surface to the owner as a failed claim.
// The result is returned (not thrown) so callers can assert on delivery.
export async function notifyNewClaim(
  claim: NewClaimNotification
): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    const error = "RESEND_API_KEY is not set — new-claim alert not sent."
    console.error(`[CLAIM_NOTIFY] ${error}`)
    return { ok: false, error }
  }

  const to = process.env.CLAIM_NOTIFICATION_TO ?? DEFAULT_TO
  const from = process.env.CLAIM_NOTIFICATION_FROM ?? DEFAULT_FROM

  try {
    // Service role: the alert wants cafe + claimant details that the claimant's
    // own RLS scope doesn't necessarily cover.
    const admin = createAdminClient()
    const [{ data: cafe }, { data: profile }] = await Promise.all([
      admin
        .from("cafes")
        .select("name, address")
        .eq("id", claim.cafeId)
        .maybeSingle(),
      admin
        .from("profiles")
        .select("full_name, email")
        .eq("id", claim.claimantId)
        .maybeSingle(),
    ])

    const cafeName = cafe?.name ?? "(unknown cafe)"
    const claimantEmail = claim.claimantEmail ?? profile?.email ?? null

    // Only link to the admin queue when we actually know where it lives — a
    // dead CTA is worse than no CTA (same reason nook-admin gates its own).
    const adminSiteUrl = process.env.ADMIN_SITE_URL?.replace(/\/+$/, "")
    const reviewLine = adminSiteUrl
      ? ["", `Review it: ${adminSiteUrl}/admin/claims`]
      : []

    const claimantName = profile?.full_name ?? "(no name on file)"
    const cafeAddress = cafe?.address ?? "(none on file)"

    // A text-only message is itself a mild spam signal, so send a multipart
    // mail: the HTML part carries the same facts, nothing exclusive to it.
    const rows: Array<[string, string]> = [
      ["Cafe", cafeName],
      ["Address", cafeAddress],
      ["Claimant", claimantName],
      ["Email", claimantEmail ?? "(no email on file)"],
      ["Role", claim.role],
      ["Code", claim.verificationCode ?? "(none)"],
    ]
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;max-width:520px">
<p style="font-size:15px;line-height:1.5"><strong>${escapeHtml(cafeName)}</strong> has a new ${escapeHtml(claim.role)} claim awaiting review.</p>
<table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="color:#6b7280;padding-right:16px">${k}</td><td>${escapeHtml(v)}</td></tr>`
  )
  .join("\n")}
</table>
<p style="font-size:13px;color:#6b7280;line-height:1.5">The claimant must DM this code from the cafe's official Instagram account before the claim is approved.</p>
${adminSiteUrl ? `<p style="font-size:14px"><a href="${adminSiteUrl}/admin/claims" style="color:#3A5A40">Review it in the admin queue</a></p>` : ""}
<p style="font-size:11px;color:#9ca3af">Claim ${escapeHtml(claim.claimId)} · Cafe ${escapeHtml(claim.cafeId)} · User ${escapeHtml(claim.claimantId)}</p>
</div>`

    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: claimantEmail ?? undefined,
      subject: `New cafe claim: ${cafeName}`,
      html,
      text: [
        `${cafeName} has a new ${claim.role} claim awaiting review.`,
        "",
        `Cafe:        ${cafeName}`,
        `Address:     ${cafe?.address ?? "(none on file)"}`,
        `Cafe ID:     ${claim.cafeId}`,
        "",
        `Claimant:    ${profile?.full_name ?? "(no name on file)"}`,
        `Email:       ${claimantEmail ?? "(no email on file)"}`,
        `User ID:     ${claim.claimantId}`,
        `Role:        ${claim.role}`,
        "",
        `Claim ID:    ${claim.claimId}`,
        `Code:        ${claim.verificationCode ?? "(none)"}`,
        "",
        "The claimant must DM this code from the cafe's official Instagram",
        "account before the claim is approved.",
        ...reviewLine,
      ].join("\n"),
    })

    if (error) {
      console.error("[CLAIM_NOTIFY] Resend rejected the alert:", {
        name: error.name,
        message: error.message,
      })
      return { ok: false, error: `${error.name}: ${error.message}` }
    }

    console.log("[CLAIM_NOTIFY] New-claim alert sent:", data?.id)
    return { ok: true, id: data?.id ?? null }
  } catch (e) {
    console.error("[CLAIM_NOTIFY] Unhandled failure sending alert:", e)
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
