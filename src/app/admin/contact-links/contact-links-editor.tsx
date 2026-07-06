"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteContactLink,
  reorderContactLinks,
  saveContactLink,
} from "@/app/admin/contact-links/actions";

type Row = {
  id?: string;
  label: string;
  url: string;
  iconName: string;
  displayOrder: number;
};

export function ContactLinksEditor({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const set = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  async function persist(i: number) {
    const row = rows[i];
    if (!row.label.trim() || !row.url.trim()) return;
    const res = await saveContactLink({
      id: row.id,
      label: row.label,
      url: row.url,
      iconName: row.iconName,
      displayOrder: row.displayOrder,
    });
    if (!res.ok) return toast.error(res.error ?? "Save failed");
    if (!row.id) set(i, { id: res.id });
    toast.success("Saved");
  }

  async function remove(i: number) {
    const row = rows[i];
    if (row.id && !confirm(`Delete "${row.label}"?`)) return;
    if (row.id) await deleteContactLink(row.id);
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onDrop(target: number) {
    if (draggingIndex === null || draggingIndex === target) return;
    const next = [...rows];
    const [moved] = next.splice(draggingIndex, 1);
    next.splice(target, 0, moved);
    const reindexed = next.map((r, idx) => ({ ...r, displayOrder: idx }));
    setRows(reindexed);
    setDraggingIndex(null);
    const ids = reindexed.map((r) => r.id).filter(Boolean) as string[];
    if (ids.length > 0) {
      await reorderContactLinks(ids);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <li
            key={row.id ?? `new-${i}`}
            draggable
            onDragStart={() => setDraggingIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 p-2"
          >
            <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
            <Input
              value={row.label}
              onChange={(e) => set(i, { label: e.target.value })}
              placeholder="Label (e.g. LinkedIn)"
              className="w-40"
              onBlur={() => persist(i)}
            />
            <Input
              value={row.url}
              onChange={(e) => set(i, { url: e.target.value })}
              placeholder="https://..."
              className="flex-1"
              onBlur={() => persist(i)}
            />
            <Input
              value={row.iconName}
              onChange={(e) => set(i, { iconName: e.target.value })}
              placeholder="icon"
              className="w-24"
              onBlur={() => persist(i)}
            />
            <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(i)}>
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            { label: "", url: "", iconName: "", displayOrder: prev.length },
          ])
        }
      >
        <Plus className="mr-1 size-4" /> Add link
      </Button>
    </div>
  );
}
