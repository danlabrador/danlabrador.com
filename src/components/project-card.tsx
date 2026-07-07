import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/content-types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col gap-2 rounded-lg border border-border/60 bg-card/30 p-5 transition-all hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold tracking-tight text-foreground">
          {project.title}
        </h3>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      {project.tagline && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.tagline}
        </p>
      )}
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {project.techTags.slice(0, 5).map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}
