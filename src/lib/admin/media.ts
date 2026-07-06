import { randomBytes } from "node:crypto";

export type MediaAssetSummary = {
  id: string;
  url: string;
  r2Key: string;
  mimeType: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  uploadedAt: string; // ISO
};

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export function assertUploadable(mimeType: string, size: number) {
  if (!ALLOWED.has(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
  if (size > MAX_BYTES) {
    throw new Error(`File too large (${(size / 1024 / 1024).toFixed(1)} MB)`);
  }
}

export function generateR2Key(mimeType: string): string {
  const ext = EXT[mimeType] ?? "bin";
  const rand = randomBytes(8).toString("hex");
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `uploads/${yyyy}/${mm}/${rand}.${ext}`;
}
