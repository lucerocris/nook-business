// Validates a redirect param as a same-origin path. Uses the WHATWG URL parser
// (the same one the attack abuses) so control-char bypasses can't slip through:
// "/\t/evil.com" and "/\evil.com" both parse to an external origin and are
// rejected. Returns the parsed same-origin path (path + query + hash) so the
// value handed to redirect() is always clean.
const BASE = "https://nook.internal";

export function getSafeRedirect(
  value?: string | null,
  fallback = "/",
): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return fallback;
  }
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) {
      return fallback;
    }
    const path = `${url.pathname}${url.search}${url.hash}`;
    return path.startsWith("/") ? path : fallback;
  } catch {
    return fallback;
  }
}
