"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  body: z.custom<unknown>((v) => v !== undefined, { message: "Body required" }).nullable(),
});

export async function saveNow(input: z.infer<typeof schema>) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  await prisma.nowPage.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", body: (parsed.data.body ?? null) as never },
    update: { body: (parsed.data.body ?? null) as never },
  });
  revalidatePath("/now");
  revalidatePath("/admin/now");
  return { ok: true as const };
}
