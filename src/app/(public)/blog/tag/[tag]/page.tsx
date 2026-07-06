import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/content";
import { seedAllTags } from "@/lib/content-seed";

export async function generateStaticParams() {
  return seedAllTags().map((tag) => ({ tag }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `Posts tagged #${tag}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = (await getPublishedPosts()).filter((p) => p.tags.includes(tag));
  if (posts.length === 0) notFound();

  return (
    <Container className="py-20">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All posts
      </Link>

      <header className="mt-8 max-w-2xl">
        <p className="mb-3 text-sm text-muted-foreground">Tag</p>
        <h1 className="text-4xl font-semibold tracking-tight">#{tag}</h1>
      </header>

      <div className="mt-10 divide-y divide-border/60">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </Container>
  );
}
