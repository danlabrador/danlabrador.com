import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { SkillsEditor } from "@/app/admin/skills/skills-editor";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  await requireAdmin();
  const skills = await prisma.skill.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Skills
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Skills shown on the homepage
        </h1>
      </header>
      <SkillsEditor
        initial={skills.map((s) => ({
          id: s.id,
          label: s.label,
          iconName: s.iconName ?? "",
          category: s.category ?? "",
          proficiency: s.proficiency ?? null,
          displayOrder: s.displayOrder,
        }))}
      />
    </div>
  );
}
