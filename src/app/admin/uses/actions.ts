"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  id: z.string().optional(),
  category: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional().nullable(),
  url: z.string().url().optional().or(z.literal("")).nullable(),
  displayOrder: z.number().int().default(0),
});

export type UsesInput = z.infer<typeof schema>;

function bust() {
  revalidatePath("/uses");
  revalidatePath("/admin/uses");
}

export async function saveUses(input: UsesInput) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const d = parsed.data;
  const rec = d.id
    ? await prisma.usesItem.update({
        where: { id: d.id },
        data: {
          category: d.category,
          label: d.label,
          description: d.description || null,
          url: d.url ? d.url : null,
          displayOrder: d.displayOrder,
        },
      })
    : await prisma.usesItem.create({
        data: {
          category: d.category,
          label: d.label,
          description: d.description || null,
          url: d.url ? d.url : null,
          displayOrder: d.displayOrder,
        },
      });
  bust();
  return { ok: true as const, id: rec.id };
}

export async function deleteUses(id: string) {
  await requireAdmin();
  await prisma.usesItem.delete({ where: { id } });
  bust();
}
