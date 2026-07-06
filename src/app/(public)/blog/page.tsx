import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/post-card";
import { getAllTags, getPublishedPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on analytics engineering, tooling, and the craft of turning messy data into useful systems.",
};

export default async function BlogIndex() {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getAllTags()]);

  return (
    <Container className="py-20">
      <header className="max-w-2xl">
        <p className="mb-3 text-sm text-muted-foreground">Blog</p>
        <h1 className="text-4xl font-semibold tracking-tight">Writing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Notes on analytics engineering, tooling, and the craft of turning
          messy data into useful systems.
        </p>
      </header>

      {tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 divide-y divide-border/60">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="py-8 text-sm text-muted-foreground">No posts yet.</p>
        )}
      </div>
    </Container>
  );
}
