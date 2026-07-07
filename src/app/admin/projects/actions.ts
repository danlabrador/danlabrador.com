"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { slugify } from "@/lib/slug";

const saveProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  techTags: z.array(z.string()).default([]),
  thumbnailId: z.string().nullable().optional(),
  repoUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  // JSON-encoded Tiptap doc (or empty string for no case study).
  caseStudyBody: z.string().default(""),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export type SaveProjectInput = z.infer<typeof saveProjectSchema>;

export async function saveProject(input: SaveProjectInput) {
  await requireAdmin();
  const parsed = saveProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  let caseStudyBody: unknown = null;
  if (data.caseStudyBody) {
    try {
      caseStudyBody = JSON.parse(data.caseStudyBody);
    } catch {
      return { ok: false as const, error: "Invalid case study JSON" };
    }
  }

  const slug = await uniqueSlug(data.slug || slugify(data.title), data.id);

  const project = data.id
    ? await prisma.project.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          tagline: data.tagline || null,
          description: data.description,
          techTags: data.techTags,
          thumbnailId: data.thumbnailId ?? null,
          repoUrl: data.repoUrl ? data.repoUrl : null,
          liveUrl: data.liveUrl ? data.liveUrl : null,
          caseStudyBody: caseStudyBody as never,
          featured: data.featured,
          displayOrder: data.displayOrder,
        },
      })
    : await prisma.project.create({
        data: {
          title: data.title,
          slug,
          tagline: data.tagline || null,
          description: data.description,
          techTags: data.techTags,
          thumbnailId: data.thumbnailId ?? null,
          repoUrl: data.repoUrl ? data.repoUrl : null,
          liveUrl: data.liveUrl ? data.liveUrl : null,
          caseStudyBody: caseStudyBody as never,
          featured: data.featured,
          displayOrder: data.displayOrder,
        },
      });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/admin/projects");
  return { ok: true as const, id: project.id, slug: project.slug };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const project = await prisma.project.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/admin/projects");
}

export async function createEmptyProject() {
  await requireAdmin();
  const project = await prisma.project.create({
    data: {
      title: "Untitled project",
      slug: `untitled-${randomBytes(4).toString("hex")}`,
      description: "",
      techTags: [],
    },
  });
  redirect(`/admin/projects/${project.id}`);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const clean = base && base.length > 0 ? base : `project-${randomBytes(4).toString("hex")}`;
  let candidate = clean;
  let suffix = 1;
  for (;;) {
    const existing = await prisma.project.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    suffix += 1;
    candidate = `${clean}-${suffix}`;
  }
}
