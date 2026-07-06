import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  url: z.string().url(),
  r2Key: z.string().min(1),
  mimeType: z.string().min(1),
  bytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  altText: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      url: parsed.data.url,
      r2Key: parsed.data.r2Key,
      mimeType: parsed.data.mimeType,
      bytes: parsed.data.bytes,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
      altText: parsed.data.altText ?? null,
    },
  });

  return NextResponse.json({
    id: asset.id,
    url: asset.url,
    r2Key: asset.r2Key,
    mimeType: asset.mimeType,
    altText: asset.altText,
    width: asset.width,
    height: asset.height,
    uploadedAt: asset.uploadedAt.toISOString(),
  });
}
