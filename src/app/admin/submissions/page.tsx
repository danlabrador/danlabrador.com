import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { SubmissionsList } from "@/app/admin/submissions/submissions-list";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  await requireAdmin();
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { submittedAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Inbox
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Contact submissions</h1>
      </header>
      <SubmissionsList
        initial={submissions.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          message: s.message,
          projectType: s.projectType,
          budget: s.budget,
          timeline: s.timeline,
          submittedAt: s.submittedAt.toISOString(),
          readAt: s.readAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
