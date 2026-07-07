"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const schema = z.object({
  // JSON-encoded Tiptap doc (or empty string).
  body: z.string().default(""),
});

export async function saveNow(input: z.infer<typeof schema>) {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  let body: unknown = null;
  if (parsed.data.body) {
    try {
      body = JSON.parse(parsed.data.body);
    } catch {
      return { ok: false as const, error: "Invalid body JSON" };
    }
  }

  await prisma.nowPage.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", body: body as never },
    update: { body: body as never },
  });
  revalidatePath("/now");
  revalidatePath("/admin/now");
  return { ok: true as const };
}
