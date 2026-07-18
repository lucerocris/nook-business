import s3Client from "@/config/digitalOcean"
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
  await s3Client.send(
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
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: requireBucket(),
      Key:    key,
    })
  )
}

export function getKeyFromUrl(url: string): string {
  return url.replace(`${requireCdn()}/`, "")
}
