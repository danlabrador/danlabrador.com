import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { EducationEditor } from "@/app/admin/education/education-editor";

export const dynamic = "force-dynamic";

function isoDate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EducationPage() {
  await requireAdmin();
  const rows = await prisma.education.findMany({
    orderBy: [{ startDate: "desc" }],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Education
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Programs</h1>
      </header>
      <EducationEditor
        initial={rows.map((r) => ({
          id: r.id,
          program: r.program,
          institution: r.institution,
          startDate: isoDate(r.startDate ?? null),
          endDate: isoDate(r.endDate ?? null),
          displayOrder: r.displayOrder,
        }))}
      />
    </div>
  );
}
