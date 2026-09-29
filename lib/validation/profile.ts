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

// Stored hours come from hand entry and imports, so they aren't uniform:
// "7:30" (no leading zero), "24:00" for midnight, and a few corrupted values
// like "21:0020:00". `<input type="time">` renders anything but HH:MM as
// blank, and the old strict check rejected the whole save, so 31 of 55
// cafes couldn't save any edit. Normalize instead: pad the hour, map 24:00
// to 00:00, and turn anything unparseable into "" for the owner to re-enter.
// Mirrors parseHHMM in nook-webapp/lib/utils/hours.ts.
export function normalizeTime(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 24 || minutes > 59) return null
  if (hours === 24) return minutes === 0 ? "00:00" : null
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function normalizeDayHours(raw: unknown): DayHours {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    open: normalizeTime(obj.open) ?? "",
    close: normalizeTime(obj.close) ?? "",
    closed: obj.closed === true,
  }
}

/** Closing at or before opening means the cafe closes after midnight. */
export function closesNextDay(h: DayHours): boolean {
  return !h.closed && !!h.open && !!h.close && h.open !== h.close && h.close < h.open
}

/** Per-day problem, or null when the day is fine. Shared by form and server. */
export function dayHoursError(h: DayHours): string | null {
  if (h.closed) return null
  if (!normalizeTime(h.open) || !normalizeTime(h.close)) {
    return "Add opening and closing times, or mark this day closed"
  }
  if (normalizeTime(h.open) === normalizeTime(h.close)) {
    return "Opening and closing times can't match. Open all day? Use 12:00 AM to 11:59 PM"
  }
  return null
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

  // Operating hours. A close time at or before the open time is an overnight
  // day (e.g. 18:00 to 02:00); the webapp and mobile "open now" logic both
  // read it that way. Split shifts still aren't representable.
  const operating_hours: OperatingHours = {}
  for (const day of DAY_KEYS) {
    const h = input.operating_hours?.[day]
    if (!h) return { ok: false, error: `Missing hours for ${cap(day)}` }
    const problem = dayHoursError(h)
    if (problem) return { ok: false, error: `${cap(day)}: ${problem}` }
    operating_hours[day] = {
      open: normalizeTime(h.open) ?? "",
      close: normalizeTime(h.close) ?? "",
      closed: h.closed === true,
    }
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
