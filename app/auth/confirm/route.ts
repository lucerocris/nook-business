import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/safe-redirect";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (!tokenHash || !type || type !== "signup") {
    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", request.url)
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    type: "signup",
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", request.url)
    );
  }

  const redirectTo = getSafeRedirect(next);

  return NextResponse.redirect(
    new URL(redirectTo, request.url)
  );
}