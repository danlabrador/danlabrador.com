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
import { Switch } from "@/components/ui/switch";
import { TiptapEditor } from "@/components/admin/editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { saveProject, deleteProject } from "@/app/admin/projects/actions";
import type { MediaAssetSummary } from "@/lib/admin/media";
import { slugify } from "@/lib/slug";

type ProjectForm = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  techTags: string[];
  thumbnail: MediaAssetSummary | null;
  repoUrl: string;
  liveUrl: string;
  caseStudyBody: unknown;
  featured: boolean;
  displayOrder: number;
};

export function ProjectEditor({ project }: { project: ProjectForm }) {
  const router = useRouter();
  const [state, setState] = useState<ProjectForm>(project);
  const [tagInput, setTagInput] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setPending(true);
    try {
      const res = await saveProject({
        id: state.id,
        title: state.title,
        slug: state.slug,
        tagline: state.tagline,
        description: state.description,
        techTags: state.techTags,
        thumbnailId: state.thumbnail?.id ?? null,
        repoUrl: state.repoUrl,
        liveUrl: state.liveUrl,
        caseStudyBody: state.caseStudyBody ? JSON.stringify(state.caseStudyBody) : "",
        featured: state.featured,
        displayOrder: state.displayOrder,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Save failed");
        return;
      }
      set("slug", res.slug);
      toast.success("Saved");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this project? This can't be undone.")) return;
    await deleteProject(state.id);
    toast.success("Deleted");
    router.push("/admin/projects");
  }

  function addTag() {
    const label = tagInput.trim();
    if (!label) return;
    if (!state.techTags.includes(label)) set("techTags", [...state.techTags, label]);
    setTagInput("");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/admin/projects"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← All projects
          </Link>
          <h1 className="mt-1 truncate text-sm text-muted-foreground">
            /projects/{state.slug}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${state.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View <ExternalLink className="ml-1 size-3.5" />
          </Link>
          <Button size="sm" onClick={save} disabled={pending}>
            Save
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={remove}>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={state.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="One-line summary shown on cards."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={state.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Short description shown on the projects list."
            />
          </div>

          <div className="space-y-2">
            <Label>Case study (optional)</Label>
            <TiptapEditor
              value={state.caseStudyBody}
              onChange={(json) => set("caseStudyBody", json)}
              placeholder="Long-form writeup shown on the project detail page..."
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
            <Label>Thumbnail</Label>
            {state.thumbnail ? (
              <div className="space-y-2">
                <div className="relative aspect-video overflow-hidden rounded-md border border-border/60 bg-muted">
                  <Image
                    src={state.thumbnail.url}
                    alt={state.thumbnail.altText ?? ""}
                    fill
                    sizes="280px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                    Change
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => set("thumbnail", null)}>
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                Choose image
              </Button>
            )}
            <MediaPicker
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              onPick={(asset) => {
                setPickerOpen(false);
                set("thumbnail", asset);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="featured">Featured on homepage</Label>
              <p className="text-xs text-muted-foreground">
                Shown in the &ldquo;Selected work&rdquo; section.
              </p>
            </div>
            <Switch
              id="featured"
              checked={state.featured}
              onCheckedChange={(v) => set("featured", v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={state.displayOrder}
              onChange={(e) => set("displayOrder", Number(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tech tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {state.techTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    set(
                      "techTags",
                      state.techTags.filter((t) => t !== tag),
                    )
                  }
                >
                  {tag} ×
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
              placeholder="Add tech + Enter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repo URL</Label>
            <Input
              id="repoUrl"
              value={state.repoUrl}
              onChange={(e) => set("repoUrl", e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input
              id="liveUrl"
              value={state.liveUrl}
              onChange={(e) => set("liveUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
