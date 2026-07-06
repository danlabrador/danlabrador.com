"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  heroHeadline: z.string().min(1),
  heroSubheadline: z.string().optional().nullable(),
  aboutBody: z.custom<unknown>((v) => v !== undefined, { message: "Body required" }).nullable(),
});

export async function saveAbout(input: z.infer<typeof schema>) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const d = parsed.data;
  await prisma.aboutContent.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      heroHeadline: d.heroHeadline,
      heroSubheadline: d.heroSubheadline || null,
      aboutBody: (d.aboutBody ?? null) as never,
    },
    update: {
      heroHeadline: d.heroHeadline,
      heroSubheadline: d.heroSubheadline || null,
      aboutBody: (d.aboutBody ?? null) as never,
    },
  });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { ok: true as const };
}
