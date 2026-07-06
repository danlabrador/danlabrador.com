import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { ProjectEditor } from "@/app/admin/projects/[id]/project-editor";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { thumbnail: true },
  });
  if (!project) notFound();

  return (
    <ProjectEditor
      project={{
        id: project.id,
        title: project.title,
        slug: project.slug,
        tagline: project.tagline ?? "",
        description: project.description,
        techTags: project.techTags,
        thumbnail: project.thumbnail
          ? {
              id: project.thumbnail.id,
              url: project.thumbnail.url,
              r2Key: project.thumbnail.r2Key,
              mimeType: project.thumbnail.mimeType,
              altText: project.thumbnail.altText,
              width: project.thumbnail.width,
              height: project.thumbnail.height,
              uploadedAt: project.thumbnail.uploadedAt.toISOString(),
            }
          : null,
        repoUrl: project.repoUrl ?? "",
        liveUrl: project.liveUrl ?? "",
        caseStudyBody: project.caseStudyBody,
        featured: project.featured,
        displayOrder: project.displayOrder,
      }}
    />
  );
}
