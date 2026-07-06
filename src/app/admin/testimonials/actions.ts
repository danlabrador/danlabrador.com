"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  id: z.string().optional(),
  quote: z.string().min(1),
  authorName: z.string().min(1),
  authorRole: z.string().optional().nullable(),
  authorAvatarId: z.string().nullable().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")).nullable(),
  displayOrder: z.number().int().default(0),
});

export type TestimonialInput = z.infer<typeof schema>;

function bust() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/testimonials");
}

export async function saveTestimonial(input: TestimonialInput) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const d = parsed.data;
  const rec = d.id
    ? await prisma.testimonial.update({
        where: { id: d.id },
        data: {
          quote: d.quote,
          authorName: d.authorName,
          authorRole: d.authorRole || null,
          authorAvatarId: d.authorAvatarId ?? null,
          sourceUrl: d.sourceUrl ? d.sourceUrl : null,
          displayOrder: d.displayOrder,
        },
      })
    : await prisma.testimonial.create({
        data: {
          quote: d.quote,
          authorName: d.authorName,
          authorRole: d.authorRole || null,
          authorAvatarId: d.authorAvatarId ?? null,
          sourceUrl: d.sourceUrl ? d.sourceUrl : null,
          displayOrder: d.displayOrder,
        },
      });
  bust();
  return { ok: true as const, id: rec.id };
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  bust();
}
