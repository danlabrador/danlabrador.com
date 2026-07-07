"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { plainJson } from "@/lib/plain-json";

const schema = z.object({
  body: z.custom<unknown>((v) => v !== undefined, { message: "Body required" }).nullable(),
});

export async function saveNow(input: z.infer<typeof schema>) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const body = parsed.data.body ? plainJson(parsed.data.body) : null;
  await prisma.nowPage.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", body: body as never },
    update: { body: body as never },
  });
  revalidatePath("/now");
  revalidatePath("/admin/now");
  return { ok: true as const };
}
