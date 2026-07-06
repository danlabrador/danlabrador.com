import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { createEmptyProject } from "@/app/admin/projects/actions";

export const dynamic = "force-dynamic";

export default async function ProjectsIndex() {
  await requireAdmin();
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Projects
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">All projects</h1>
        </div>
        <form action={createEmptyProject}>
          <Button type="submit">
            <Plus className="mr-1 size-4" /> New project
          </Button>
        </form>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
          No projects yet.
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/admin/projects/${project.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:text-foreground"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {project.featured && (
                      <Star className="size-3.5 fill-current text-muted-foreground" />
                    )}
                    <p className="truncate font-medium">{project.title}</p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    /projects/{project.slug}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  order: {project.displayOrder}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
