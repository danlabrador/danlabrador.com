import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/app/admin/posts/[id]/post-editor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      coverImage: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
  });
  if (!post) notFound();

  return (
    <PostEditor
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        bodyJson: post.bodyJson,
        coverImage: post.coverImage
          ? {
              id: post.coverImage.id,
              url: post.coverImage.url,
              r2Key: post.coverImage.r2Key,
              mimeType: post.coverImage.mimeType,
              altText: post.coverImage.altText,
              width: post.coverImage.width,
              height: post.coverImage.height,
              uploadedAt: post.coverImage.uploadedAt.toISOString(),
            }
          : null,
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
        tags: post.tags.map((t) => t.tag.name),
        category: post.categories[0]?.category.name ?? "",
        status: post.status,
        previewToken: post.previewToken,
      }}
    />
  );
}
