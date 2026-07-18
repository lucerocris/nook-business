// Pure validation/normalization for the owner profile form. Imported by both
// the server action (authoritative) and the client (fast feedback), so it must
// stay free of any server-only imports.

export type DayHours = { open: string; close: string; closed: boolean }
export type OperatingHours = Record<string, DayHours>

export type SocialLinks = {
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  website: string | null
}

export type ProfileInput = {
  name: string
  description: string
  operating_hours: OperatingHours
  social_links: { instagram: string; facebook: string; tiktok: string; website: string }
}

export type NormalizedProfile = {
  name: string
  description: string | null
  operating_hours: OperatingHours
  social_links: SocialLinks
}

export type ProfileValidation =
  | { ok: true; value: NormalizedProfile }
  | { ok: false; error: string }

const NAME_MAX = 100
const DESC_MAX = 1000
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

const SOCIAL_KEYS = ["instagram", "facebook", "tiktok", "website"] as const
const SOCIAL_LABELS: Record<(typeof SOCIAL_KEYS)[number], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  website: "Website",
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Accepts an absolute http(s) URL; empty → null. Returns a message on invalid.
function normalizeUrl(raw: string): string | null | { error: string } {
  const v = raw.trim()
  if (!v) return null
  let url: URL
  try {
    url = new URL(v)
  } catch {
    return { error: "enter a full URL starting with https://" }
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "links must start with http:// or https://" }
  }
  return url.toString()
}

export function validateAndNormalizeProfile(input: ProfileInput): ProfileValidation {
  const name = input.name.trim()
  if (!name) return { ok: false, error: "Cafe name is required" }
  if (name.length > NAME_MAX)
    return { ok: false, error: `Cafe name must be ${NAME_MAX} characters or fewer` }

  const descRaw = (input.description ?? "").trim()
  if (descRaw.length > DESC_MAX)
    return { ok: false, error: `Description must be ${DESC_MAX} characters or fewer` }
  const description = descRaw ? descRaw : null

  // Operating hours — validate each day; enforce open < close for open days.
  // (Cross-midnight / split shifts aren't representable in this shape yet.)
  const operating_hours: OperatingHours = {}
  for (const day of DAY_KEYS) {
    const h = input.operating_hours?.[day]
    if (!h) return { ok: false, error: `Missing hours for ${cap(day)}` }
    if (h.closed) {
      operating_hours[day] = { open: h.open, close: h.close, closed: true }
      continue
    }
    if (!TIME_RE.test(h.open) || !TIME_RE.test(h.close)) {
      return { ok: false, error: `${cap(day)}: enter valid open and close times` }
    }
    if (h.open >= h.close) {
      return {
        ok: false,
        error: `${cap(day)}: closing time must be after opening time`,
      }
    }
    operating_hours[day] = { open: h.open, close: h.close, closed: false }
  }

  // Social links — normalize empties to null, reject anything that isn't a URL.
  const social_links: SocialLinks = {
    instagram: null,
    facebook: null,
    tiktok: null,
    website: null,
  }
  for (const key of SOCIAL_KEYS) {
    const res = normalizeUrl(input.social_links?.[key] ?? "")
    if (res && typeof res === "object") {
      return { ok: false, error: `${SOCIAL_LABELS[key]}: ${res.error}` }
    }
    social_links[key] = res
  }

  return { ok: true, value: { name, description, operating_hours, social_links } }
}
