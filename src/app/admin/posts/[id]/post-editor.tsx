"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TiptapEditor } from "@/components/admin/editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { savePost, deletePost } from "@/app/admin/posts/actions";
import type { MediaAssetSummary } from "@/lib/admin/media";
import { slugify } from "@/lib/slug";

type PostForm = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyJson: unknown;
  coverImage: MediaAssetSummary | null;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  category: string;
  status: "DRAFT" | "PUBLISHED";
  previewToken: string | null;
};

export function PostEditor({ post }: { post: PostForm }) {
  const router = useRouter();
  const [state, setState] = useState<PostForm>(post);
  const [tagInput, setTagInput] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof PostForm>(key: K, value: PostForm[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  async function save(nextStatus?: "DRAFT" | "PUBLISHED") {
    setPending(true);
    try {
      const res = await savePost({
        id: state.id,
        title: state.title,
        slug: state.slug,
        excerpt: state.excerpt,
        bodyJson: state.bodyJson,
        coverImageId: state.coverImage?.id ?? null,
        seoTitle: state.seoTitle,
        seoDescription: state.seoDescription,
        tags: state.tags,
        category: state.category,
        status: nextStatus ?? state.status,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Save failed");
        return;
      }
      set("status", nextStatus ?? state.status);
      set("slug", res.slug);
      toast.success(nextStatus === "PUBLISHED" ? "Published" : "Saved");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this post? This can't be undone.")) return;
    await deletePost(state.id);
    toast.success("Deleted");
    router.push("/admin/posts");
  }

  function addTag() {
    const label = tagInput.trim();
    if (!label) return;
    if (!state.tags.includes(label)) set("tags", [...state.tags, label]);
    setTagInput("");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/posts"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← All posts
            </Link>
            {state.status === "DRAFT" && (
              <Badge variant="secondary" className="text-[10px]">
                Draft
              </Badge>
            )}
          </div>
          <h1 className="mt-1 truncate text-sm text-muted-foreground">
            /blog/{state.slug}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {state.status === "PUBLISHED" && (
            <Link
              href={`/blog/${state.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View <ExternalLink className="ml-1 size-3.5" />
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => save("DRAFT")}
            disabled={pending}
          >
            Save draft
          </Button>
          <Button
            size="sm"
            onClick={() => save("PUBLISHED")}
            disabled={pending}
          >
            {state.status === "PUBLISHED" ? "Update" : "Publish"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete post"
            onClick={remove}
            disabled={pending}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={state.title}
              onChange={(e) => set("title", e.target.value)}
              onBlur={() => {
                if (!state.slug || state.slug.startsWith("untitled-")) {
                  set("slug", slugify(state.title));
                }
              }}
              placeholder="Post title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={state.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              placeholder="Optional — auto-generated from the body if blank."
            />
          </div>

          <div className="space-y-2">
            <Label>Body</Label>
            <TiptapEditor
              value={state.bodyJson}
              onChange={(json) => set("bodyJson", json)}
              placeholder="Start writing..."
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={state.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Cover image</Label>
            {state.coverImage ? (
              <div className="space-y-2">
                <div className="relative aspect-video overflow-hidden rounded-md border border-border/60 bg-muted">
                  <Image
                    src={state.coverImage.url}
                    alt={state.coverImage.altText ?? ""}
                    fill
                    sizes="280px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                  >
                    Change
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => set("coverImage", null)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
              >
                Choose image
              </Button>
            )}
            <MediaPicker
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              onPick={(asset) => {
                setPickerOpen(false);
                set("coverImage", asset);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={state.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. notes"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {state.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    set(
                      "tags",
                      state.tags.filter((t) => t !== tag),
                    )
                  }
                >
                  #{tag} ×
                </Badge>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder="Add tag + Enter"
            />
          </div>

          <div className="space-y-2 border-t border-border/60 pt-6">
            <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              SEO
            </Label>
            <div className="space-y-2">
              <Input
                value={state.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                placeholder="SEO title (defaults to post title)"
              />
              <Textarea
                value={state.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                placeholder="SEO description (defaults to excerpt)"
                rows={3}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
