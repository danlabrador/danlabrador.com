import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    assets: assets.map((a) => ({
      id: a.id,
      url: a.url,
      r2Key: a.r2Key,
      mimeType: a.mimeType,
      altText: a.altText,
      width: a.width,
      height: a.height,
      uploadedAt: a.uploadedAt.toISOString(),
    })),
  });
}
