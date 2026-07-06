"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const skillSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  iconName: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  proficiency: z.number().int().min(1).max(5).optional().nullable(),
  displayOrder: z.number().int().default(0),
});

export type SkillInput = z.infer<typeof skillSchema>;

function bust() {
  revalidatePath("/");
  revalidatePath("/admin/skills");
}

export async function saveSkill(input: SkillInput) {
  await requireAdmin();
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input" };
  }
  const data = parsed.data;
  const skill = data.id
    ? await prisma.skill.update({
        where: { id: data.id },
        data: {
          label: data.label,
          iconName: data.iconName || null,
          category: data.category || null,
          proficiency: data.proficiency ?? null,
          displayOrder: data.displayOrder,
        },
      })
    : await prisma.skill.create({
        data: {
          label: data.label,
          iconName: data.iconName || null,
          category: data.category || null,
          proficiency: data.proficiency ?? null,
          displayOrder: data.displayOrder,
        },
      });
  bust();
  return { ok: true as const, id: skill.id };
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  await prisma.skill.delete({ where: { id } });
  bust();
}

export async function reorderSkills(ids: string[]) {
  await requireAdmin();
  await Promise.all(
    ids.map((id, index) =>
      prisma.skill.update({ where: { id }, data: { displayOrder: index } }),
    ),
  );
  bust();
}
