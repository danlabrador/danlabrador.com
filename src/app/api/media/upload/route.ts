import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { presignedUploadUrl, publicUrlFor } from "@/lib/r2";
import { assertUploadable, generateR2Key } from "@/lib/admin/media";

const schema = z.object({
  mimeType: z.string(),
  size: z.number().int().positive(),
  filename: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { mimeType, size } = parsed.data;
  try {
    assertUploadable(mimeType, size);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload rejected" },
      { status: 400 },
    );
  }

  const key = generateR2Key(mimeType);
  const uploadUrl = await presignedUploadUrl(key, mimeType);
  const publicUrl = publicUrlFor(key);

  return NextResponse.json({ uploadUrl, publicUrl, r2Key: key });
}
