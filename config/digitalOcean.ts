import { S3Client } from "@aws-sdk/client-s3"

let cached: S3Client | null = null

// Built lazily so a missing endpoint fails loudly at upload time (like
// requireBucket/requireCdn in lib/upload.ts) rather than throwing at import
// time — which would break every page that transitively imports this — or
// silently falling back to AWS's default endpoint.
//
// Accepts the plural DO_SPACES_ENDPOINT (consistent with the other DO_SPACES_*
// vars) and still honours the original singular DO_SPACE_ENDPOINT so existing
// deployments keep working.
export function getS3Client(): S3Client {
  if (cached) return cached

  const endpoint =
    process.env.DO_SPACES_ENDPOINT ?? process.env.DO_SPACE_ENDPOINT

  if (!endpoint) {
    throw new Error(
      "DO_SPACES_ENDPOINT is not configured (DigitalOcean Spaces endpoint)"
    )
  }

  cached = new S3Client({
    endpoint,
    // Spaces ignores the region for routing but the SDK requires one; this
    // value is what request signing uses, so leave it alone.
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY!,
      secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
  })

  return cached
}
