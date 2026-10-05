import { headers } from "next/headers";

// Absolute base URL for email links: prefer the configured site URL, fall back
// to the request's own origin so links aren't "undefined/..." when
// NEXT_PUBLIC_SITE_URL is unset. Call it during the request (not inside
// after()), while the headers are still there.
export async function getBaseUrl(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}
