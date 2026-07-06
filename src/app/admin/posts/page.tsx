import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { createEmptyPost } from "@/app/admin/posts/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PostsIndex() {
  await requireAdmin();

  const posts = await prisma.post.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Blog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Posts</h1>
        </div>
        <form action={createEmptyPost}>
          <Button type="submit">
            <Plus className="mr-1 size-4" /> New post
          </Button>
        </form>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
          No posts yet.
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:text-foreground"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{post.title || "Untitled"}</p>
                    {post.status === "DRAFT" && (
                      <Badge variant="secondary" className="text-[10px]">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    /blog/{post.slug}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {formatDate((post.publishedAt ?? post.updatedAt).toISOString())}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
