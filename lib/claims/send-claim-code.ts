import { createAdminClient } from "@/lib/supabase/admin"

// Same verified nookph.app sender as the team alerts (notify-new-claim).
const DEFAULT_FROM = "Nook <noreply@nookph.app>"
// ig.me opens the DM thread straight away, in the Instagram app on a phone.
const DM_URL = "https://ig.me/m/nook_cafefinder"

export type ClaimCodeEmail = {
  to: string
  cafeId: string
  code: string
  expiresAt: Date
  isNewListing: boolean
  // Absolute, e.g. https://business.nookph.app/claim/status. Resolved by the
  // caller while it still has the request.
  statusUrl: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// The owner's own copy of their verification code, sent when a claim or a new
// listing is created. Until now the code lived only on /claim/status, so an
// owner who closed the tab had to find their way back to it. Best-effort: the
// claim is already committed, so every failure logs and returns, never throws.
export async function sendClaimCode(email: ClaimCodeEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[CLAIM_CODE] RESEND_API_KEY is not set; code email not sent.")
    return
  }

  try {
    const { data: cafe } = await createAdminClient()
      .from("cafes")
      .select("name")
      .eq("id", email.cafeId)
      .maybeSingle()
    const cafeName = cafe?.name ?? "your cafe"

    const sendBy = email.expiresAt.toLocaleDateString("en-PH", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Manila",
    })
    const subject = `Your Nook code for ${cafeName}: ${email.code}`
    const lead = email.isNewListing
      ? `Thanks for adding ${cafeName} to Nook. To show it's yours, send us this code from the cafe's Instagram account.`
      : `To finish claiming ${cafeName} on Nook, send us this code from the cafe's Instagram account.`
    const next = email.isNewListing
      ? "Once it arrives we check it, usually within 1–2 working days, and email you. Then you set up your page (photos, hours, a description) and send it to us to publish."
      : "Once it arrives we check it, usually within 1–2 working days, and email you when your owner dashboard is ready."

    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;max-width:520px;margin:0 auto;padding:24px">
<img src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nookLogo.png" alt="Nook" width="80" style="display:block;margin-bottom:24px">
<p style="font-size:15px;line-height:1.6">${escapeHtml(lead)}</p>
<p style="margin:24px 0;padding:16px;background:#f7f6f2;border-radius:12px;text-align:center;font-family:ui-monospace,Menlo,monospace;font-size:26px;font-weight:600;letter-spacing:0.3em;color:#101514">${escapeHtml(email.code)}</p>
<ol style="font-size:15px;line-height:1.6;padding-left:20px">
<li>Switch to <strong>${escapeHtml(cafeName)}</strong>'s Instagram account. Messages from personal accounts can't verify a cafe.</li>
<li>Send the code to <a href="${DM_URL}" style="color:#3A5A40;font-weight:600">@nook_cafefinder</a> in a DM.</li>
</ol>
<p style="font-size:15px;line-height:1.6"><strong>Send it by ${escapeHtml(sendBy)}.</strong> ${escapeHtml(next)}</p>
<p style="margin:28px 0;text-align:center"><a href="${DM_URL}" style="display:inline-block;background:#3A5A40;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:15px;font-weight:600">Message @nook_cafefinder</a></p>
<p style="font-size:14px;line-height:1.6">Check where things stand anytime: <a href="${email.statusUrl}" style="color:#3A5A40">${escapeHtml(email.statusUrl)}</a></p>
<p style="font-size:12px;color:#9ca3af;margin-top:32px">Questions? Message us on Instagram at @nook_cafefinder.<br>You got this email because you started verifying ${escapeHtml(cafeName)} on Nook for Business.</p>
</div>`

    const text = [
      lead,
      "",
      `Your code: ${email.code}`,
      "",
      `1. Switch to ${cafeName}'s Instagram account. Messages from personal accounts can't verify a cafe.`,
      `2. Send the code to @nook_cafefinder in a DM: ${DM_URL}`,
      "",
      `Send it by ${sendBy}. ${next}`,
      "",
      `Check where things stand: ${email.statusUrl}`,
      "",
      "Questions? Message us on Instagram at @nook_cafefinder.",
    ].join("\n")

    const { Resend } = await import("resend")
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.CLAIM_NOTIFICATION_FROM ?? DEFAULT_FROM,
      to: email.to,
      subject,
      html,
      text,
    })
    if (error) {
      console.error("[CLAIM_CODE] Resend rejected the code email:", error.name, error.message)
    }
  } catch (e) {
    console.error("[CLAIM_CODE] Failed to send code email:", e)
  }
}
