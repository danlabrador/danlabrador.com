"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  id: z.string().optional(),
  program: z.string().min(1),
  institution: z.string().min(1),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  displayOrder: z.number().int().default(0),
});

export type EducationInput = z.infer<typeof schema>;

function bust() {
  revalidatePath("/about");
  revalidatePath("/admin/education");
}

export async function saveEducation(input: EducationInput) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const d = parsed.data;
  const rec = d.id
    ? await prisma.education.update({
        where: { id: d.id },
        data: {
          program: d.program,
          institution: d.institution,
          startDate: d.startDate ? new Date(d.startDate) : null,
          endDate: d.endDate ? new Date(d.endDate) : null,
          displayOrder: d.displayOrder,
        },
      })
    : await prisma.education.create({
        data: {
          program: d.program,
          institution: d.institution,
          startDate: d.startDate ? new Date(d.startDate) : null,
          endDate: d.endDate ? new Date(d.endDate) : null,
          displayOrder: d.displayOrder,
        },
      });
  bust();
  return { ok: true as const, id: rec.id };
}

export async function deleteEducation(id: string) {
  await requireAdmin();
  await prisma.education.delete({ where: { id } });
  bust();
}
