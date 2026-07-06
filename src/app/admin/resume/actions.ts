"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { deleteObject } from "@/lib/r2";

const schema = z.object({
  fileUrl: z.string().url(),
  r2Key: z.string().min(1),
  versionLabel: z.string().optional(),
});

export async function registerResume(input: z.infer<typeof schema>) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  await prisma.resume.updateMany({
    where: { isCurrent: true },
    data: { isCurrent: false },
  });
  const rec = await prisma.resume.create({
    data: {
      fileUrl: parsed.data.fileUrl,
      r2Key: parsed.data.r2Key,
      versionLabel: parsed.data.versionLabel ?? null,
      isCurrent: true,
    },
  });
  revalidatePath("/admin/resume");
  return { ok: true as const, id: rec.id };
}

export async function makeResumeCurrent(id: string) {
  await requireAdmin();
  await prisma.resume.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
  await prisma.resume.update({ where: { id }, data: { isCurrent: true } });
  revalidatePath("/admin/resume");
}

export async function deleteResume(id: string) {
  await requireAdmin();
  const rec = await prisma.resume.findUnique({ where: { id } });
  if (!rec) return;
  await deleteObject(rec.r2Key).catch(() => {});
  await prisma.resume.delete({ where: { id } });
  revalidatePath("/admin/resume");
}
