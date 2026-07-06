import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { NowEditor } from "@/app/admin/now/now-editor";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NowAdminPage() {
  await requireAdmin();
  const now = await prisma.nowPage.findUnique({ where: { id: "singleton" } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Now
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">/now</h1>
        {now?.updatedAt && (
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated {formatDate(now.updatedAt.toISOString())}
          </p>
        )}
      </header>
      <NowEditor initial={{ body: now?.body ?? null }} />
    </div>
  );
}
