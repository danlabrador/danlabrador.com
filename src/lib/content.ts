// Public content getters. Query Prisma first; fall back to the seed content
// module when the DB is unreachable or empty. This lets the site render in
// three states — no DB, empty DB, or populated DB — with the same code.

import { prisma } from "@/lib/prisma";
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
import {
  seedAbout,
  seedAllProjects,
  seedAllTags,
  seedContactLinks,
  seedEducation,
  seedExperience,
  seedFeaturedProjects,
  seedNow,
  seedPostBySlug,
  seedProjectBySlug,
  seedPublishedPosts,
  seedSkills,
  seedTestimonials,
  seedUses,
} from "@/lib/content-seed";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getAbout(): Promise<AboutContent> {
  return safe(async () => {
    const row = await prisma.aboutContent.findUnique({ where: { id: "singleton" } });
    if (!row) return seedAbout();
    return {
      heroHeadline: row.heroHeadline,
      heroSubheadline: row.heroSubheadline ?? undefined,
      bodyMarkdown: "",
      // aboutBody is Tiptap JSON — pages that need it should render via TiptapContent.
      // We stuff the seed bodyMarkdown as a legacy fallback via ABOUT if row missing.
    } as AboutContent;
  }, seedAbout());
}

export async function getAboutBodyJson(): Promise<unknown | null> {
  return safe(async () => {
    const row = await prisma.aboutContent.findUnique({ where: { id: "singleton" } });
    return row?.aboutBody ?? null;
  }, null);
}

export async function getSkills(): Promise<Skill[]> {
  return safe(async () => {
    const rows = await prisma.skill.findMany({ orderBy: { displayOrder: "asc" } });
    if (rows.length === 0) return seedSkills();
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      iconName: r.iconName ?? undefined,
      category: r.category ?? undefined,
    }));
  }, seedSkills());
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return safe(async () => {
    const rows = await prisma.project.findMany({
      where: { featured: true },
      orderBy: { displayOrder: "asc" },
      include: { thumbnail: true },
    });
    if (rows.length === 0) return seedFeaturedProjects();
    return rows.map(toProjectShape);
  }, seedFeaturedProjects());
}

export async function getAllProjects(): Promise<Project[]> {
  return safe(async () => {
    const rows = await prisma.project.findMany({
      orderBy: { displayOrder: "asc" },
      include: { thumbnail: true },
    });
    if (rows.length === 0) return seedAllProjects();
    return rows.map(toProjectShape);
  }, seedAllProjects());
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return safe(async () => {
    const row = await prisma.project.findUnique({
      where: { slug },
      include: { thumbnail: true },
    });
    if (!row) return seedProjectBySlug(slug);
    return toProjectShape(row);
  }, seedProjectBySlug(slug));
}

export async function getExperience(): Promise<Experience[]> {
  return safe(async () => {
    const rows = await prisma.experience.findMany({ orderBy: { startDate: "desc" } });
    if (rows.length === 0) return seedExperience();
    return rows.map((r) => ({
      id: r.id,
      role: r.role,
      company: r.company,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate?.toISOString(),
      bullets: Array.isArray(r.bulletsJson) ? (r.bulletsJson as string[]) : [],
    }));
  }, seedExperience());
}

export async function getEducation(): Promise<Education[]> {
  return safe(async () => {
    const rows = await prisma.education.findMany({ orderBy: { startDate: "desc" } });
    if (rows.length === 0) return seedEducation();
    return rows.map((r) => ({
      id: r.id,
      program: r.program,
      institution: r.institution,
      startDate: r.startDate?.toISOString(),
      endDate: r.endDate?.toISOString(),
    }));
  }, seedEducation());
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return safe(async () => {
    const rows = await prisma.testimonial.findMany({ orderBy: { displayOrder: "asc" } });
    if (rows.length === 0) return seedTestimonials();
    return rows.map((r) => ({
      id: r.id,
      quote: r.quote,
      authorName: r.authorName,
      authorRole: r.authorRole ?? undefined,
      sourceUrl: r.sourceUrl ?? undefined,
    }));
  }, seedTestimonials());
}

export async function getContactLinks(): Promise<ContactLink[]> {
  return safe(async () => {
    const rows = await prisma.contactLink.findMany({ orderBy: { displayOrder: "asc" } });
    if (rows.length === 0) return seedContactLinks();
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      url: r.url,
      iconName: r.iconName ?? undefined,
    }));
  }, seedContactLinks());
}

export async function getPublishedPosts(): Promise<Post[]> {
  return safe(async () => {
    const rows = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { tags: { include: { tag: true } }, categories: { include: { category: true } } },
    });
    if (rows.length === 0) return seedPublishedPosts();
    return rows.map(toPostShape);
  }, seedPublishedPosts());
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return safe(async () => {
    const row = await prisma.post.findUnique({
      where: { slug },
      include: { tags: { include: { tag: true } }, categories: { include: { category: true } } },
    });
    if (!row || row.status !== "PUBLISHED") return seedPostBySlug(slug);
    return toPostShape(row);
  }, seedPostBySlug(slug));
}

export async function getAllTags(): Promise<string[]> {
  return safe(async () => {
    const tags = await prisma.tag.findMany({
      where: { posts: { some: { post: { status: "PUBLISHED" } } } },
      select: { slug: true },
      orderBy: { slug: "asc" },
    });
    if (tags.length === 0) return seedAllTags();
    return tags.map((t) => t.slug);
  }, seedAllTags());
}

export async function getUses(): Promise<UsesItem[]> {
  return safe(async () => {
    const rows = await prisma.usesItem.findMany({
      orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
    });
    if (rows.length === 0) return seedUses();
    return rows.map((r) => ({
      id: r.id,
      category: r.category,
      label: r.label,
      description: r.description ?? undefined,
      url: r.url ?? undefined,
    }));
  }, seedUses());
}

export async function getNow(): Promise<NowContent> {
  return safe(async () => {
    const row = await prisma.nowPage.findUnique({ where: { id: "singleton" } });
    if (!row) return seedNow();
    return {
      bodyMarkdown: "",
      updatedAt: row.updatedAt.toISOString(),
    };
  }, seedNow());
}

export async function getNowBodyJson(): Promise<unknown | null> {
  return safe(async () => {
    const row = await prisma.nowPage.findUnique({ where: { id: "singleton" } });
    return row?.body ?? null;
  }, null);
}

export async function getCurrentResumeUrl(): Promise<string | null> {
  return safe(async () => {
    const row = await prisma.resume.findFirst({ where: { isCurrent: true } });
    return row?.fileUrl ?? null;
  }, null);
}

// ─── Shape adapters ─────────────────────────────────────────────────────

type PrismaProjectWithThumb = Awaited<
  ReturnType<
    typeof prisma.project.findUnique
  >
> & {
  thumbnail?: { url: string; altText: string | null } | null;
};

function toProjectShape(r: NonNullable<PrismaProjectWithThumb>): Project {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    tagline: r.tagline ?? undefined,
    description: r.description,
    techTags: r.techTags,
    thumbnail: r.thumbnail
      ? { url: r.thumbnail.url, alt: r.thumbnail.altText ?? "" }
      : undefined,
    repoUrl: r.repoUrl ?? undefined,
    liveUrl: r.liveUrl ?? undefined,
    featured: r.featured,
    displayOrder: r.displayOrder,
    caseStudyBodyJson: r.caseStudyBody ?? undefined,
  };
}

type PrismaPostWithRelations = Awaited<
  ReturnType<
    typeof prisma.post.findUnique
  >
> & {
  tags: Array<{ tag: { slug: string; name: string } }>;
  categories: Array<{ category: { slug: string; name: string } }>;
};

function toPostShape(r: NonNullable<PrismaPostWithRelations>): Post {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    bodyJson: r.bodyJson,
    tags: r.tags.map((t) => t.tag.slug),
    category: r.categories[0]?.category.name,
    status: r.status === "PUBLISHED" ? "published" : "draft",
    publishedAt: r.publishedAt?.toISOString(),
    readingTimeMinutes: r.readingTimeMinutes ?? 1,
  };
}
