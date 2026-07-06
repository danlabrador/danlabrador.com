import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { ResumeEditor } from "@/app/admin/resume/resume-editor";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  await requireAdmin();
  const resumes = await prisma.resume.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Resume
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Resume versions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a new PDF anytime. The <em>current</em> version is what
          visitors see at /resume.pdf. Older versions are archived here.
        </p>
      </header>
      <ResumeEditor
        initial={resumes.map((r) => ({
          id: r.id,
          fileUrl: r.fileUrl,
          r2Key: r.r2Key,
          versionLabel: r.versionLabel ?? "",
          isCurrent: r.isCurrent,
          uploadedAt: r.uploadedAt.toISOString(),
        }))}
      />
    </div>
  );
}
