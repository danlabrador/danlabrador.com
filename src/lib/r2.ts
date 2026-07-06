import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID()}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID(),
        secretAccessKey: env.R2_SECRET_ACCESS_KEY(),
      },
    });
  }
  return client;
}

export function publicUrlFor(key: string): string {
  const base = env.R2_PUBLIC_URL().replace(/\/+$/, "");
  return `${base}/${encodeURI(key)}`;
}

export async function presignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME(), Key: key }),
  );
}
