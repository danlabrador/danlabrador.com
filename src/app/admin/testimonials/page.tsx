import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { TestimonialsEditor } from "@/app/admin/testimonials/testimonials-editor";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  await requireAdmin();
  const rows = await prisma.testimonial.findMany({
    orderBy: { displayOrder: "asc" },
    include: { authorAvatar: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Testimonials
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Recommendations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          LinkedIn doesn&rsquo;t expose recommendations via API, so paste them
          here as they come in and link the <em>Source URL</em> field back to
          the original LinkedIn post as proof.
        </p>
      </header>
      <TestimonialsEditor
        initial={rows.map((r) => ({
          id: r.id,
          quote: r.quote,
          authorName: r.authorName,
          authorRole: r.authorRole ?? "",
          authorAvatar: r.authorAvatar
            ? {
                id: r.authorAvatar.id,
                url: r.authorAvatar.url,
                r2Key: r.authorAvatar.r2Key,
                mimeType: r.authorAvatar.mimeType,
                altText: r.authorAvatar.altText,
                width: r.authorAvatar.width,
                height: r.authorAvatar.height,
                uploadedAt: r.authorAvatar.uploadedAt.toISOString(),
              }
            : null,
          sourceUrl: r.sourceUrl ?? "",
          displayOrder: r.displayOrder,
        }))}
      />
    </div>
  );
}
