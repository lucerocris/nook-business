import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Landing point for the invite email sent by the invite-owner edge function.
//
// Deliberately outside /owner: middleware gates that segment and the invitee
// has no session until the code below is exchanged, so anything under /owner
// would bounce them to /login before they could accept.
//
// Supabase redirects here with ?code=... after verifying the emailed token.
// Mirrors nook-admin's /login/reset-password route.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(
      new URL("/accept-invite/set-password?error=missing_code", request.url)
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL("/accept-invite/set-password?error=link_expired", request.url)
    )
  }

  return NextResponse.redirect(
    new URL("/accept-invite/set-password", request.url)
  )
}
