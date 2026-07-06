import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { AboutEditor } from "@/app/admin/about/about-editor";

export const dynamic = "force-dynamic";

export default async function AboutAdminPage() {
  await requireAdmin();
  const about = await prisma.aboutContent.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">About + hero</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The headline and subheadline shown on the homepage hero, and the
          long-form body on /about.
        </p>
      </header>
      <AboutEditor
        initial={{
          heroHeadline: about?.heroHeadline ?? "",
          heroSubheadline: about?.heroSubheadline ?? "",
          aboutBody: about?.aboutBody ?? null,
        }}
      />
    </div>
  );
}
