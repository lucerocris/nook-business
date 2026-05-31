import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const getSafeRedirect = (value?: string | null) => {
  if (value && value.startsWith("/")) {
    return value;
  }

  return "/dashboard";
};

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

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
