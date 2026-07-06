import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "@/app/admin/media/media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireAdmin();
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Media library
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Uploaded files
        </h1>
      </header>

      <MediaLibrary
        initial={assets.map((a) => ({
          id: a.id,
          url: a.url,
          r2Key: a.r2Key,
          mimeType: a.mimeType,
          altText: a.altText,
          width: a.width,
          height: a.height,
          uploadedAt: a.uploadedAt.toISOString(),
        }))}
      />
    </div>
  );
}
