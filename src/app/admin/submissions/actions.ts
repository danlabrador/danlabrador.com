"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function markSubmissionRead(id: string, read: boolean) {
  await requireAdmin();
  await prisma.contactSubmission.update({
    where: { id },
    data: { readAt: read ? new Date() : null },
  });
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
}

export async function deleteSubmission(id: string) {
  await requireAdmin();
  await prisma.contactSubmission.delete({ where: { id } });
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
}
