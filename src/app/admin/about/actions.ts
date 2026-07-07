"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  heroHeadline: z.string().min(1),
  heroSubheadline: z.string().optional().nullable(),
  // JSON-encoded Tiptap doc (or empty string).
  aboutBody: z.string().default(""),
});

export async function saveAbout(input: z.infer<typeof schema>) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const d = parsed.data;

  let aboutBody: unknown = null;
  if (d.aboutBody) {
    try {
      aboutBody = JSON.parse(d.aboutBody);
    } catch {
      return { ok: false as const, error: "Invalid body JSON" };
    }
  }

  await prisma.aboutContent.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      heroHeadline: d.heroHeadline,
      heroSubheadline: d.heroSubheadline || null,
      aboutBody: aboutBody as never,
    },
    update: {
      heroHeadline: d.heroHeadline,
      heroSubheadline: d.heroSubheadline || null,
      aboutBody: aboutBody as never,
    },
  });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { ok: true as const };
}
