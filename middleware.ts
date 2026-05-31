import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/middleware";

const PUBLIC_AUTH_ROUTES = new Set(["/", "/login", "/register"]);

const getSetCookies = (headers: Headers) => {
  const getSetCookie = (
    headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.();

  if (getSetCookie && getSetCookie.length > 0) {
    return getSetCookie;
  }

  const singleCookie = headers.get("set-cookie");
  return singleCookie ? [singleCookie] : [];
};

const withSupabaseCookies = (
  supabaseResponse: NextResponse,
  response: NextResponse,
) => {
  const cookies = getSetCookies(supabaseResponse.headers);
  cookies.forEach((cookie) => response.headers.append("set-cookie", cookie));
  return response;
};

const hasOwnerRow = async (supabase: ReturnType<typeof createClient>["supabase"], userId: string) => {
  const { data, error } = await supabase
    .from("cafe_owner_cafe")
    .select("owner_id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
};

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isOwnerRoute = pathname === "/owner" || pathname.startsWith("/owner/");
  const isPublicRoute = PUBLIC_AUTH_ROUTES.has(pathname);

  if (isOwnerRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", "/owner/dashboard");
      return withSupabaseCookies(
        supabaseResponse,
        NextResponse.redirect(loginUrl),
      );
    }

    const isOwner = await hasOwnerRow(supabase, user.id);
    if (!isOwner) {
      return withSupabaseCookies(
        supabaseResponse,
        NextResponse.redirect(new URL("/", request.url)),
      );
    }

    return supabaseResponse;
  }

  if (user && isPublicRoute) {
    const isOwner = await hasOwnerRow(supabase, user.id);
    if (isOwner) {
      return withSupabaseCookies(
        supabaseResponse,
        NextResponse.redirect(new URL("/owner/dashboard", request.url)),
      );
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
