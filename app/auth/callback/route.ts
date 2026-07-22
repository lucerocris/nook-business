import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/safe-redirect";

// OAuth (PKCE) landing point. Google sends the browser here with ?code, which
// is exchanged for a session cookie. The matching verifier cookie was written
// by signInWithGoogle, so this only works in the same browser that started the
// flow — a stale or copied link fails closed to the login page.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // Google reports a cancelled consent screen as ?error=access_denied rather
  // than by omitting the code, so both have to be treated as a failed sign-in.
  const providerError = searchParams.get("error");

  if (providerError || !code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }

  let destination = getSafeRedirect(next);

  // Same single-hop resolution as the password path in actions/auth.ts: without
  // it the owner lands on "/" and middleware bounces them to the dashboard
  // mid-transition, leaving the marketing navbar painted over the dashboard.
  if (destination === "/") {
    const { data: ownerRow } = await supabase
      .from("cafe_owner_cafe")
      .select("owner_id")
      .eq("owner_id", data.user.id)
      .limit(1)
      .maybeSingle();

    if (ownerRow) destination = "/owner/dashboard";
  }

  return NextResponse.redirect(new URL(destination, request.url));
}
