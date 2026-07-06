import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { ExperienceEditor } from "@/app/admin/experience/experience-editor";

export const dynamic = "force-dynamic";

function isoDate(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function ExperiencePage() {
  await requireAdmin();
  const rows = await prisma.experience.findMany({
    orderBy: [{ startDate: "desc" }],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Experience
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Roles</h1>
      </header>
      <ExperienceEditor
        initial={rows.map((r) => ({
          id: r.id,
          role: r.role,
          company: r.company,
          startDate: isoDate(r.startDate),
          endDate: isoDate(r.endDate ?? null),
          bullets: Array.isArray(r.bulletsJson) ? (r.bulletsJson as string[]) : [],
          displayOrder: r.displayOrder,
        }))}
      />
    </div>
  );
}
