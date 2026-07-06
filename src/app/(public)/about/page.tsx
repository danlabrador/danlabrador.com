import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Markdown } from "@/lib/markdown";
import { getAbout, getEducation, getExperience } from "@/lib/content";
import { formatMonthYear } from "@/lib/format";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "About",
  description: "Dan Labrador — analytics engineer, currently at My Amazon Guy.",
};

export default function AboutPage() {
  const about = getAbout();
  const experience = getExperience();
  const education = getEducation();

  return (
    <Container className="py-20">
      <header className="max-w-2xl">
        <p className="mb-3 text-sm text-muted-foreground">About</p>
        <h1 className="text-4xl font-semibold tracking-tight">{about.heroHeadline}</h1>
        {about.heroSubheadline && (
          <p className="mt-4 text-lg text-muted-foreground">{about.heroSubheadline}</p>
        )}
      </header>

      <section className="mt-12 max-w-2xl">
        <Markdown>{about.bodyMarkdown}</Markdown>
      </section>

      <section className="mt-20">
        <SectionHeader title="Experience" />
        <ol className="space-y-8">
          {experience.map((role) => (
            <li key={role.id} className="grid grid-cols-[100px_1fr] gap-4 sm:grid-cols-[140px_1fr]">
              <div className="pt-1 text-xs text-muted-foreground">
                {formatMonthYear(role.startDate)} –{" "}
                {role.endDate ? formatMonthYear(role.endDate) : "Present"}
              </div>
              <div>
                <p className="font-medium">{role.role}</p>
                <p className="text-sm text-muted-foreground">{role.company}</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
                  {role.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <SectionHeader title="Education" />
        <ol className="space-y-6">
          {education.map((ed) => (
            <li key={ed.id} className="grid grid-cols-[100px_1fr] gap-4 sm:grid-cols-[140px_1fr]">
              <div className="pt-1 text-xs text-muted-foreground">
                {ed.startDate && formatMonthYear(ed.startDate)}
                {ed.endDate && ` – ${formatMonthYear(ed.endDate)}`}
                {ed.startDate && !ed.endDate && " – Present"}
              </div>
              <div>
                <p className="font-medium">{ed.program}</p>
                <p className="text-sm text-muted-foreground">{ed.institution}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
}
