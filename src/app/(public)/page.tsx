import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/section-header";
import { ProjectCard } from "@/components/project-card";
import { PostCard } from "@/components/post-card";
import { SkillPill } from "@/components/skill-pill";
import {
  getAbout,
  getFeaturedProjects,
  getPublishedPosts,
  getSkills,
} from "@/lib/content";
import { buttonVariants } from "@/components/ui/button";

export default async function HomePage() {
  const [about, projects, skills, allPosts] = await Promise.all([
    getAbout(),
    getFeaturedProjects(),
    getSkills(),
    getPublishedPosts(),
  ]);
  const posts = allPosts.slice(0, 4);

  return (
    <Container className="py-20 sm:py-28">
      <section className="max-w-2xl">
        <p className="mb-4 text-sm text-muted-foreground">Dan Labrador</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {about.heroHeadline}
        </h1>
        {about.heroSubheadline && (
          <p className="mt-6 text-lg text-muted-foreground">
            {about.heroSubheadline}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/contact" className={buttonVariants()}>
            Get in touch <ArrowRight className="ml-1 size-4" />
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "ghost" })}>
            More about me
          </Link>
        </div>
      </section>

      <section className="mt-24">
        <SectionHeader title="Selected work" href="/projects" hrefLabel="All projects" />
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="mt-24">
        <SectionHeader title="Skills" />
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillPill key={skill.id} skill={skill} />
          ))}
        </ul>
      </section>

      {posts.length > 0 && (
        <section className="mt-24">
          <SectionHeader title="Writing" href="/blog" hrefLabel="All posts" />
          <div className="divide-y divide-border/60">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
