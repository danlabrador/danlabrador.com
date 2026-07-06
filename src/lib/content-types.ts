// Shape of the content the site renders. Currently populated by src/lib/content.ts
// with hardcoded seed data; will be swapped to Prisma calls once the DB is provisioned.

export type Skill = {
  id: string;
  label: string;
  iconName?: string;
  category?: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  techTags: string[];
  thumbnail?: { url: string; alt: string };
  repoUrl?: string;
  liveUrl?: string;
  featured: boolean;
  displayOrder: number;
  caseStudyMarkdown?: string;
  caseStudyBodyJson?: unknown;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  startDate: string; // ISO
  endDate?: string; // ISO or undefined = current
  bullets: string[];
};

export type Education = {
  id: string;
  program: string;
  institution: string;
  startDate?: string;
  endDate?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  sourceUrl?: string;
};

export type ContactLink = {
  id: string;
  label: string;
  url: string;
  iconName?: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  /** Seed posts use markdown. */
  bodyMarkdown?: string;
  /** Published-via-admin posts store Tiptap JSON. */
  bodyJson?: unknown;
  tags: string[];
  category?: string;
  status: "draft" | "published";
  publishedAt?: string;
  readingTimeMinutes: number;
};

export type UsesItem = {
  id: string;
  category: string;
  label: string;
  description?: string;
  url?: string;
};

export type AboutContent = {
  heroHeadline: string;
  heroSubheadline?: string;
  bodyMarkdown: string;
};

export type NowContent = {
  bodyMarkdown: string;
  updatedAt: string;
};
