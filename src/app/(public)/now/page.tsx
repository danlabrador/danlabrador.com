import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Markdown } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import { getNow } from "@/lib/content";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm focused on right now.",
};

export default function NowPage() {
  const now = getNow();
  return (
    <Container className="py-20">
      <header className="max-w-2xl">
        <p className="mb-3 text-sm text-muted-foreground">
          Last updated {formatDate(now.updatedAt)}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Now</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A snapshot of what I&rsquo;m spending my time on. Inspired by{" "}
          <a
            href="https://sive.rs/nowff"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-foreground"
          >
            Derek Sivers
          </a>
          .
        </p>
      </header>

      <section className="mt-10 max-w-2xl">
        <Markdown>{now.bodyMarkdown}</Markdown>
      </section>
    </Container>
  );
}
