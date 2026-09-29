import { getS3Client } from "@/config/digitalOcean"
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

const BUCKET = process.env.DO_SPACES_BUCKET
const CDN    = process.env.DO_SPACES_CDN_URL

// Fail loudly on missing config instead of silently building "undefined/..."
// image URLs (which get written to the DB and rendered as broken <img>s).
function requireCdn(): string {
  if (!CDN) throw new Error("DO_SPACES_CDN_URL is not configured")
  return CDN
}

function requireBucket(): string {
  if (!BUCKET) throw new Error("DO_SPACES_BUCKET is not configured")
  return BUCKET
}

export function getPublicUrl(key: string): string {
  return `${requireCdn()}/${key}`
}

export async function uploadFile({
  key,
  buffer,
  contentType,
}: {
  key: string
  buffer: Buffer
  contentType: string
}): Promise<string> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket:      requireBucket(),
      Key:         key,
      Body:        buffer,
      ContentType: contentType,
      ACL:         "public-read",
    })
  )
  return getPublicUrl(key)
}

export async function deleteFile(key: string): Promise<void> {
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: requireBucket(),
      Key:    key,
    })
  )
}

// Only URLs that actually live on our CDN map to a bucket key. `replace` used
// to pass any other string straight through, so a foreign URL became a literal
// "key" — S3 answers 204 for a key that doesn't exist, and the caller would
// report a successful delete for an object it never touched.
//
// Older rows (40 URLs across 9 cafes as of 2026-09-29) point at the Space's
// origin host rather than its CDN host, e.g.
//   https://lucerocris.sgp1.digitaloceanspaces.com/nook/...
//   https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook/...
// Both address the same object, so both map to the same key.
export function getKeyFromUrl(url: string): string {
  const cdn = requireCdn().replace(/\/+$/, "")
  const prefixes = [`${cdn}/`, `${cdn.replace(".cdn.digitaloceanspaces.com", ".digitaloceanspaces.com")}/`]
  const prefix = prefixes.find((p) => url.startsWith(p))
  if (!prefix) {
    throw new Error("URL is not a Nook CDN object")
  }
  return url.slice(prefix.length)
}
