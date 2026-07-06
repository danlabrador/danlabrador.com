"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  url: z.string().url(),
  iconName: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
});

export type ContactLinkInput = z.infer<typeof schema>;

function bust() {
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/contact-links");
}

export async function saveContactLink(input: ContactLinkInput) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const data = parsed.data;
  const record = data.id
    ? await prisma.contactLink.update({
        where: { id: data.id },
        data: {
          label: data.label,
          url: data.url,
          iconName: data.iconName || null,
          displayOrder: data.displayOrder,
        },
      })
    : await prisma.contactLink.create({
        data: {
          label: data.label,
          url: data.url,
          iconName: data.iconName || null,
          displayOrder: data.displayOrder,
        },
      });
  bust();
  return { ok: true as const, id: record.id };
}

export async function deleteContactLink(id: string) {
  await requireAdmin();
  await prisma.contactLink.delete({ where: { id } });
  bust();
}

export async function reorderContactLinks(ids: string[]) {
  await requireAdmin();
  await Promise.all(
    ids.map((id, index) =>
      prisma.contactLink.update({ where: { id }, data: { displayOrder: index } }),
    ),
  );
  bust();
}
