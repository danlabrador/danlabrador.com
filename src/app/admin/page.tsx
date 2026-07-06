import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireAdmin();

  const [posts, drafts, projects, submissions, subscribers, recentDrafts] =
    await Promise.all([
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.project.count(),
      prisma.contactSubmission.count({ where: { readAt: null } }),
      prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
      prisma.post.findMany({
        where: { status: "DRAFT" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, updatedAt: true },
      }),
    ]);

  const stats = [
    { label: "Published posts", value: posts, href: "/admin/posts" },
    { label: "Drafts", value: drafts, href: "/admin/posts?status=draft" },
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Unread inquiries", value: submissions, href: "/admin/submissions" },
    { label: "Subscribers", value: subscribers, href: "/admin/subscribers" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Welcome back{session.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}.
        </h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-lg border border-border/60 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</p>
          </Link>
        ))}
      </section>

      {recentDrafts.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Recent drafts
            </h2>
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              All posts <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border/60">
            {recentDrafts.map((draft) => (
              <li key={draft.id}>
                <Link
                  href={`/admin/posts/${draft.id}`}
                  className="flex items-baseline justify-between gap-4 py-3 text-sm hover:text-foreground"
                >
                  <span>{draft.title || "Untitled"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(draft.updatedAt.toISOString())}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
