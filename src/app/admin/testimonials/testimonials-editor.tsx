"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/admin/media-picker";
import type { MediaAssetSummary } from "@/lib/admin/media";
import {
  deleteTestimonial,
  saveTestimonial,
} from "@/app/admin/testimonials/actions";

type Row = {
  id?: string;
  quote: string;
  authorName: string;
  authorRole: string;
  authorAvatar: MediaAssetSummary | null;
  sourceUrl: string;
  displayOrder: number;
};

export function TestimonialsEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  const set = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  async function persist(i: number) {
    const row = rows[i];
    if (!row.quote.trim() || !row.authorName.trim()) return;
    const res = await saveTestimonial({
      id: row.id,
      quote: row.quote,
      authorName: row.authorName,
      authorRole: row.authorRole,
      authorAvatarId: row.authorAvatar?.id ?? null,
      sourceUrl: row.sourceUrl,
      displayOrder: row.displayOrder,
    });
    if (!res.ok) return toast.error(res.error ?? "Save failed");
    if (!row.id) set(i, { id: res.id });
    toast.success("Saved");
  }

  async function remove(i: number) {
    const row = rows[i];
    if (row.id && !confirm(`Delete testimonial from "${row.authorName}"?`)) return;
    if (row.id) await deleteTestimonial(row.id);
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {rows.map((row, i) => (
          <li
            key={row.id ?? `new-${i}`}
            className="space-y-3 rounded-lg border border-border/60 bg-card/40 p-4"
          >
            <div className="space-y-1">
              <Label>Quote</Label>
              <Textarea
                value={row.quote}
                onChange={(e) => set(i, { quote: e.target.value })}
                onBlur={() => persist(i)}
                rows={3}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Author name</Label>
                <Input
                  value={row.authorName}
                  onChange={(e) => set(i, { authorName: e.target.value })}
                  onBlur={() => persist(i)}
                />
              </div>
              <div className="space-y-1">
                <Label>Author role</Label>
                <Input
                  value={row.authorRole}
                  onChange={(e) => set(i, { authorRole: e.target.value })}
                  onBlur={() => persist(i)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Source URL (link back to LinkedIn recommendation)</Label>
              <Input
                value={row.sourceUrl}
                onChange={(e) => set(i, { sourceUrl: e.target.value })}
                onBlur={() => persist(i)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {row.authorAvatar ? (
                  <div className="relative size-10 overflow-hidden rounded-full border border-border/60 bg-muted">
                    <Image
                      src={row.authorAvatar.url}
                      alt={row.authorAvatar.altText ?? ""}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-muted text-muted-foreground">
                    <ImageIcon className="size-4" />
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setPickerFor(i)}>
                  {row.authorAvatar ? "Change avatar" : "Add avatar"}
                </Button>
                {row.authorAvatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      set(i, { authorAvatar: null });
                      persist(i);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="mr-1 size-4" /> Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            {
              quote: "",
              authorName: "",
              authorRole: "",
              authorAvatar: null,
              sourceUrl: "",
              displayOrder: prev.length,
            },
          ])
        }
      >
        <Plus className="mr-1 size-4" /> Add testimonial
      </Button>

      <MediaPicker
        open={pickerFor !== null}
        onOpenChange={(open) => !open && setPickerFor(null)}
        onPick={(asset) => {
          if (pickerFor === null) return;
          set(pickerFor, { authorAvatar: asset });
          const target = pickerFor;
          setPickerFor(null);
          persist(target);
        }}
      />
    </div>
  );
}
