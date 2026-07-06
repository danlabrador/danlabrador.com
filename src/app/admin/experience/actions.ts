"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  id: z.string().optional(),
  role: z.string().min(1),
  company: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
  bullets: z.array(z.string()).default([]),
  displayOrder: z.number().int().default(0),
});

export type ExperienceInput = z.infer<typeof schema>;

function bust() {
  revalidatePath("/about");
  revalidatePath("/admin/experience");
}

export async function saveExperience(input: ExperienceInput) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const d = parsed.data;
  const start = new Date(d.startDate);
  const end = d.endDate ? new Date(d.endDate) : null;
  const rec = d.id
    ? await prisma.experience.update({
        where: { id: d.id },
        data: {
          role: d.role,
          company: d.company,
          startDate: start,
          endDate: end,
          bulletsJson: d.bullets as never,
          displayOrder: d.displayOrder,
        },
      })
    : await prisma.experience.create({
        data: {
          role: d.role,
          company: d.company,
          startDate: start,
          endDate: end,
          bulletsJson: d.bullets as never,
          displayOrder: d.displayOrder,
        },
      });
  bust();
  return { ok: true as const, id: rec.id };
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  await prisma.experience.delete({ where: { id } });
  bust();
}
