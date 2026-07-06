import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Markdown } from "@/lib/markdown";
import { TiptapContent } from "@/lib/tiptap/render";
import { getProjectBySlug } from "@/lib/content";
import { seedAllProjects } from "@/lib/content-seed";

export async function generateStaticParams() {
  // Use seed data only for prerender scaffolding; live pages will re-render
  // dynamically once the DB has records.
  return seedAllProjects().map((p) => ({ slug: p.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline ?? project.description.slice(0, 160),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Container className="py-16">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All projects
      </Link>

      <header className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {project.title}
        </h1>
        {project.tagline && (
          <p className="mt-3 text-lg text-muted-foreground">{project.tagline}</p>
        )}
        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.techTags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
        {(project.repoUrl || project.liveUrl) && (
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                Repo <ExternalLink className="size-3.5" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                Live <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        )}
      </header>

      <section className="mt-12 max-w-2xl">
        {project.caseStudyBodyJson ? (
          <TiptapContent json={project.caseStudyBodyJson} />
        ) : project.caseStudyMarkdown ? (
          <Markdown>{project.caseStudyMarkdown}</Markdown>
        ) : (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </section>
    </Container>
  );
}
