import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ProjectCard } from "@/components/project-card";
import { getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects — libraries, pipelines, dashboards, and internal tools.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <Container className="py-20">
      <header className="max-w-2xl">
        <p className="mb-3 text-sm text-muted-foreground">Projects</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Things I&rsquo;ve built.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A mix of small libraries, internal tools, and analytics work. Not
          everything is public.
        </p>
      </header>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Container>
  );
}
