import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { UsesEditor } from "@/app/admin/uses/uses-editor";

export const dynamic = "force-dynamic";

export default async function UsesPage() {
  await requireAdmin();
  const items = await prisma.usesItem.findMany({
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Uses
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Tools + gear</h1>
      </header>
      <UsesEditor
        initial={items.map((i) => ({
          id: i.id,
          category: i.category,
          label: i.label,
          description: i.description ?? "",
          url: i.url ?? "",
          displayOrder: i.displayOrder,
        }))}
      />
    </div>
  );
}
