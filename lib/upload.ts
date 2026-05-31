import s3Client from "@/config/digitalOcean"
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

const BUCKET = process.env.DO_SPACES_BUCKET!
const CDN    = process.env.DO_SPACES_CDN_URL!

export function getPublicUrl(key: string): string {
  return `${CDN}/${key}`
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
      Bucket:      BUCKET,
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
      Bucket: BUCKET,
      Key:    key,
    })
  )
}

export function getKeyFromUrl(url: string): string {
  return url.replace(`${CDN}/`, "")
}
