import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Markdown } from "@/lib/markdown";
import { TableOfContents } from "@/components/toc";
import { ShareButtons } from "@/components/share-buttons";
import { NewsletterForm } from "@/components/newsletter-form";
import { extractToc } from "@/lib/toc";
import { formatDate } from "@/lib/format";
import { getPostBySlug, getPublishedPosts } from "@/lib/content";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";

export async function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const toc = extractToc(post.bodyMarkdown);
  const canonical = `${SITE_URL}/blog/${post.slug}`;

  return (
    <Container className="py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All posts
      </Link>

      <article className="mt-8 grid gap-12 lg:grid-cols-[1fr_180px]">
        <div>
          <header className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> {post.readingTimeMinutes} min read
              </span>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider hover:text-foreground"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </header>

          <section className="mt-10 max-w-2xl">
            <Markdown>{post.bodyMarkdown}</Markdown>
          </section>

          <footer className="mt-16 max-w-2xl border-t border-border/60 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Enjoyed this? Share it.
              </p>
              <ShareButtons url={canonical} title={post.title} />
            </div>
            <div className="mt-8 rounded-lg border border-border/60 bg-card/40 p-5">
              <p className="text-sm font-semibold">Get the next one in your inbox.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Occasional notes, no spam.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>
          </footer>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TableOfContents items={toc} />
          </div>
        </aside>
      </article>
    </Container>
  );
}
