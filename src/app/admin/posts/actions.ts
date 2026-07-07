"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { slugify } from "@/lib/slug";
import { excerptFromDoc, readingTimeMinutes } from "@/lib/reading-time";

// The Tiptap doc is passed as a JSON string, not as an object. Next.js 16's
// server-action serialization strips nested `attrs` from plain objects, so
// we send a string across the boundary and parse it here.
const savePostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  bodyJson: z.string().min(2), // JSON-encoded Tiptap doc
  coverImageId: z.string().nullable().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export type SavePostInput = z.infer<typeof savePostSchema>;

export async function savePost(input: SavePostInput) {
  await requireAdmin();
  const parsed = savePostSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  let body: unknown;
  try {
    body = JSON.parse(data.bodyJson);
  } catch {
    return { ok: false as const, error: "Invalid JSON body" };
  }

  const slugBase = data.slug ?? slugify(data.title);
  const slug = await uniqueSlug(slugBase, data.id);

  const excerpt =
    data.excerpt && data.excerpt.trim().length > 0
      ? data.excerpt.trim()
      : excerptFromDoc(body);
  const readingTime = readingTimeMinutes(body);

  const publishedAt =
    data.status === "PUBLISHED" ? (await currentPublishedAt(data.id)) ?? new Date() : null;

  const tagConnect = await ensureTags(data.tags ?? []);
  const categoryConnect = data.category ? await ensureCategory(data.category) : null;

  const post = data.id
    ? await prisma.post.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          excerpt,
          bodyJson: body as never,
          coverImageId: data.coverImageId ?? null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          status: data.status,
          publishedAt,
          readingTimeMinutes: readingTime,
          tags: { deleteMany: {}, create: tagConnect.map((tagId) => ({ tagId })) },
          categories: categoryConnect
            ? { deleteMany: {}, create: [{ categoryId: categoryConnect }] }
            : { deleteMany: {} },
        },
      })
    : await prisma.post.create({
        data: {
          title: data.title,
          slug,
          excerpt,
          bodyJson: body as never,
          coverImageId: data.coverImageId ?? null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          status: data.status,
          publishedAt,
          readingTimeMinutes: readingTime,
          previewToken: randomBytes(12).toString("hex"),
          tags: { create: tagConnect.map((tagId) => ({ tagId })) },
          categories: categoryConnect ? { create: [{ categoryId: categoryConnect }] } : undefined,
        },
      });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin");

  return { ok: true as const, id: post.id, slug: post.slug };
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await prisma.post.delete({ where: { id } });
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
}

export async function createEmptyPost() {
  await requireAdmin();
  const post = await prisma.post.create({
    data: {
      title: "Untitled",
      slug: `untitled-${randomBytes(4).toString("hex")}`,
      bodyJson: { type: "doc", content: [{ type: "paragraph" }] } as never,
      status: "DRAFT",
      previewToken: randomBytes(12).toString("hex"),
    },
  });
  redirect(`/admin/posts/${post.id}`);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const clean = base && base.length > 0 ? base : `post-${randomBytes(4).toString("hex")}`;
  let candidate = clean;
  let suffix = 1;
  for (;;) {
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    suffix += 1;
    candidate = `${clean}-${suffix}`;
  }
}

async function ensureTags(labels: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const label of labels) {
    const slug = slugify(label);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { slug, name: label },
      update: {},
    });
    ids.push(tag.id);
  }
  return ids;
}

async function ensureCategory(label: string): Promise<string> {
  const slug = slugify(label);
  const cat = await prisma.category.upsert({
    where: { slug },
    create: { slug, name: label },
    update: {},
  });
  return cat.id;
}

async function currentPublishedAt(id?: string): Promise<Date | null> {
  if (!id) return null;
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { publishedAt: true },
  });
  return existing?.publishedAt ?? null;
}
