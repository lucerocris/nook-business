const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Shape check only, for ids that arrive from clients or third parties before
// they reach a uuid column (a malformed value fails the whole query there).
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_LIKE.test(value)
}
