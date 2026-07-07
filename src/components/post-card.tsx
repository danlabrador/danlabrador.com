import Link from "next/link";
import type { Post } from "@/lib/content-types";
import { formatDate } from "@/lib/format";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-1.5 py-4 opacity-90 transition-opacity hover:opacity-100"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-medium tracking-tight text-foreground underline decoration-transparent underline-offset-[3px] transition-colors group-hover:decoration-muted-foreground/60">
          {post.title}
        </h3>
        {post.publishedAt && (
          <time
            dateTime={post.publishedAt}
            className="shrink-0 text-xs tabular-nums text-muted-foreground"
          >
            {formatDate(post.publishedAt)}
          </time>
        )}
      </div>
      {post.excerpt && (
        <p className="line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}
    </Link>
  );
}
