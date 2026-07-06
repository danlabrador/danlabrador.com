"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteUses, saveUses } from "@/app/admin/uses/actions";

type Row = {
  id?: string;
  category: string;
  label: string;
  description: string;
  url: string;
  displayOrder: number;
};

export function UsesEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);

  const set = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  async function persist(i: number) {
    const row = rows[i];
    if (!row.label.trim() || !row.category.trim()) return;
    const res = await saveUses({
      id: row.id,
      category: row.category,
      label: row.label,
      description: row.description,
      url: row.url,
      displayOrder: row.displayOrder,
    });
    if (!res.ok) return toast.error(res.error ?? "Save failed");
    if (!row.id) set(i, { id: res.id });
    toast.success("Saved");
  }

  async function remove(i: number) {
    const row = rows[i];
    if (row.id && !confirm(`Delete "${row.label}"?`)) return;
    if (row.id) await deleteUses(row.id);
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {rows.map((row, i) => (
          <li
            key={row.id ?? `new-${i}`}
            className="space-y-2 rounded-lg border border-border/60 bg-card/40 p-3"
          >
            <div className="flex items-center gap-2">
              <Input
                value={row.category}
                onChange={(e) => set(i, { category: e.target.value })}
                placeholder="Category (Hardware, Software, ...)"
                className="w-56"
                onBlur={() => persist(i)}
              />
              <Input
                value={row.label}
                onChange={(e) => set(i, { label: e.target.value })}
                placeholder="Label"
                className="flex-1"
                onBlur={() => persist(i)}
              />
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(i)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
            <Textarea
              value={row.description}
              onChange={(e) => set(i, { description: e.target.value })}
              placeholder="Optional description"
              rows={2}
              onBlur={() => persist(i)}
            />
            <Input
              value={row.url}
              onChange={(e) => set(i, { url: e.target.value })}
              placeholder="URL (optional)"
              onBlur={() => persist(i)}
            />
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            {
              category: prev.at(-1)?.category ?? "Software",
              label: "",
              description: "",
              url: "",
              displayOrder: prev.length,
            },
          ])
        }
      >
        <Plus className="mr-1 size-4" /> Add item
      </Button>
    </div>
  );
}
