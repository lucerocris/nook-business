import { S3Client } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACE_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
})

export default s3Client
                                                                                    