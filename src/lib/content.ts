// Seed content, mirroring the live danlabrador.com. Kept in code until the
// admin panel + Prisma queries are wired; then this file becomes a thin
// wrapper around `prisma.*.findMany()`.

import type {
  AboutContent,
  ContactLink,
  Education,
  Experience,
  NowContent,
  Post,
  Project,
  Skill,
  Testimonial,
  UsesItem,
} from "@/lib/content-types";

export const ABOUT: AboutContent = {
  heroHeadline: "Analytics engineer.",
  heroSubheadline:
    "I turn messy operational data into pipelines, dashboards, and internal tools that businesses can actually run on.",
  bodyMarkdown: `I'm Dan — an analytics engineer based in the Philippines. I currently lead data at My Amazon Guy, where I've compressed a six-hour reporting cycle to fifteen minutes and cut labour-cost burn by a few points along the way.

My work sits between the messy operational reality of a growing business and the clean, opinionated systems that make it legible: BigQuery pipelines, dbt-shaped models, Looker Studio dashboards, and a lot of Python and TypeScript glue. When something needs to exist that doesn't yet, I build it.

Outside of the day job, I'm building tools at Boolean and studying computer science through the University of London and MIT MicroMasters.`,
};

export const SKILLS: Skill[] = [
  { id: "s-py", label: "Python", iconName: "python", category: "Languages" },
  { id: "s-sql", label: "SQL", iconName: "database", category: "Languages" },
  { id: "s-ts", label: "TypeScript", iconName: "typescript", category: "Languages" },
  { id: "s-bq", label: "BigQuery", iconName: "googlebigquery", category: "Data platforms" },
  { id: "s-fivetran", label: "Fivetran", iconName: "fivetran", category: "Data platforms" },
  { id: "s-airtable", label: "Airtable", iconName: "airtable", category: "Data platforms" },
  { id: "s-looker", label: "Looker Studio", iconName: "looker", category: "BI + reporting" },
  { id: "s-zapier", label: "Zapier", iconName: "zapier", category: "Automation" },
  { id: "s-gcp", label: "Google Cloud", iconName: "googlecloud", category: "Infrastructure" },
  { id: "s-docker", label: "Docker", iconName: "docker", category: "Infrastructure" },
  { id: "s-pyspark", label: "PySpark", iconName: "apachespark", category: "Data platforms" },
  { id: "s-next", label: "Next.js", iconName: "nextdotjs", category: "Application" },
];

export const PROJECTS: Project[] = [
  {
    id: "p-throttler",
    slug: "api-request-throttler",
    title: "API Request Throttler",
    tagline: "A tiny Python library for taming rate limits.",
    description:
      "A small, batteries-included rate-limiting library for Python HTTP clients. Handles per-endpoint quotas, retry-after headers, and back-pressure with an ergonomic decorator API.",
    techTags: ["Python", "asyncio", "pytest"],
    repoUrl: "https://github.com/danlabrador/api-request-throttler",
    featured: true,
    displayOrder: 1,
  },
  {
    id: "p-finance",
    slug: "finance-automation",
    title: "Finance automation pipelines",
    tagline: "Close-the-books workflows for a services business.",
    description:
      "A set of BigQuery + Cloud Run pipelines that reconcile receivables against invoicing tools, forecast burn, and surface anomalies to a Slack channel each morning.",
    techTags: ["BigQuery", "Cloud Run", "Python", "Slack"],
    featured: true,
    displayOrder: 2,
  },
  {
    id: "p-asana",
    slug: "asana-data-model",
    title: "Asana data model + dashboards",
    tagline: "Making project data legible without changing how people work.",
    description:
      "A dimensional model of Asana workspaces (tasks, projects, teams, custom fields) that powers on-time-delivery and workload dashboards without asking anyone to change how they track work.",
    techTags: ["dbt", "BigQuery", "Looker Studio"],
    featured: true,
    displayOrder: 3,
  },
  {
    id: "p-portfolio",
    slug: "danlabrador-com",
    title: "danlabrador.com v2",
    tagline: "This site.",
    description:
      "A rebuild of my personal site as a full-stack Next.js app with a self-hosted admin panel, WYSIWYG blog, and everything editable end-to-end.",
    techTags: ["Next.js", "Prisma", "Auth.js", "R2", "Tiptap"],
    repoUrl: "https://github.com/danlabrador/danlabrador.com",
    featured: true,
    displayOrder: 4,
  },
];

export const EXPERIENCE: Experience[] = [
  {
    id: "e-mag-2",
    role: "Analytics Engineer",
    company: "My Amazon Guy",
    startDate: "2024-04-01",
    bullets: [
      "Rebuilt the operational reporting stack in BigQuery + dbt, cutting report latency from six hours to fifteen minutes.",
      "Shipped a labour-cost model that helped reduce burn rate by three percentage points quarter-over-quarter.",
      "Own the Fivetran / dbt / Looker Studio pipeline and mentor two analysts.",
    ],
  },
  {
    id: "e-mag-1",
    role: "Data Analyst",
    company: "My Amazon Guy",
    startDate: "2023-06-01",
    endDate: "2024-04-01",
    bullets: [
      "Built the first version of the internal reporting layer that later became the analytics team's foundation.",
      "Automated recurring client-facing reporting workflows using Python + Google Sheets APIs.",
    ],
  },
];

export const EDUCATION: Education[] = [
  {
    id: "ed-uol",
    program: "BSc Computer Science",
    institution: "University of London (via Goldsmiths)",
    startDate: "2023-09-01",
  },
  {
    id: "ed-mit",
    program: "MicroMasters in Statistics and Data Science",
    institution: "MIT (edX)",
    startDate: "2023-01-01",
  },
  {
    id: "ed-bootdev",
    program: "Backend Development",
    institution: "Boot.dev",
    startDate: "2024-09-01",
    endDate: "2025-06-01",
  },
];

export const TESTIMONIALS: Testimonial[] = [];

export const CONTACT_LINKS: ContactLink[] = [
  { id: "c-email", label: "Email", url: "mailto:dan@danlabrador.com", iconName: "mail" },
  { id: "c-linkedin", label: "LinkedIn", url: "https://linkedin.com/in/danlabrador", iconName: "linkedin" },
  { id: "c-github", label: "GitHub", url: "https://github.com/danlabrador", iconName: "github" },
  { id: "c-x", label: "X / Twitter", url: "https://x.com/danlabrador", iconName: "twitter" },
];

export const POSTS: Post[] = [
  {
    id: "post-hello",
    slug: "hello-world",
    title: "Hello world",
    excerpt:
      "A short note on why I'm rebuilding this site, and what the new version is meant to make easier.",
    tags: ["meta"],
    category: "notes",
    status: "published",
    publishedAt: "2026-07-06",
    readingTimeMinutes: 2,
    bodyMarkdown: `The old danlabrador.com was pure HTML and CSS on GitHub Pages. It was clean, it was fast, and every change required a commit.

I'm rebuilding it as a Next.js app with a proper blog editor because I finally want to be able to publish something without opening my code editor. Same minimalist look, but everything you see — skills, projects, experience, this post — is editable from an admin panel I can log into from my phone.

More coming soon. Stay tuned.`,
  },
];

export const USES: UsesItem[] = [
  {
    id: "u-mbp",
    category: "Hardware",
    label: "MacBook Pro 14\" (M3 Pro)",
    description: "Primary machine. Small enough to travel, fast enough to develop against.",
  },
  {
    id: "u-vscode",
    category: "Software",
    label: "VS Code + Claude Code",
    description: "Editor of choice. Claude Code handles the boilerplate.",
  },
  {
    id: "u-arc",
    category: "Software",
    label: "Arc",
    description: "Daily-driver browser.",
  },
  {
    id: "u-linear",
    category: "Software",
    label: "Linear",
    description: "Personal tasks + project tracking.",
  },
];

export const NOW: NowContent = {
  updatedAt: "2026-07-06",
  bodyMarkdown: `Currently:

- Leading analytics at **My Amazon Guy**, focused on operational efficiency dashboards and cost modeling.
- Building internal tools at **Boolean**, our automation and ops consultancy.
- Rebuilding this site as a proper full-stack app so the blog isn't hand-rolled HTML anymore.
- Studying computer science through the University of London degree and slowly working through the MIT MicroMasters.`,
};

// ─── Getter functions (structure mirrors what Prisma queries will return) ──

export function getAbout() {
  return ABOUT;
}

export function getSkills() {
  return [...SKILLS];
}

export function getFeaturedProjects() {
  return PROJECTS.filter((p) => p.featured).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getAllProjects() {
  return [...PROJECTS].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getExperience() {
  return [...EXPERIENCE].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
}

export function getEducation() {
  return [...EDUCATION].sort((a, b) =>
    (a.startDate ?? "") < (b.startDate ?? "") ? 1 : -1,
  );
}

export function getTestimonials() {
  return [...TESTIMONIALS];
}

export function getContactLinks() {
  return [...CONTACT_LINKS];
}

export function getPublishedPosts() {
  return POSTS.filter((p) => p.status === "published").sort((a, b) =>
    (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : -1,
  );
}

export function getPostBySlug(slug: string) {
  return POSTS.find((p) => p.slug === slug && p.status === "published");
}

export function getAllTags() {
  const set = new Set<string>();
  for (const p of POSTS) if (p.status === "published") p.tags.forEach((t) => set.add(t));
  return [...set].sort();
}

export function getUses() {
  return [...USES];
}

export function getNow() {
  return NOW;
}
