"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteSkill, reorderSkills, saveSkill } from "@/app/admin/skills/actions";

type Row = {
  id?: string;
  label: string;
  iconName: string;
  category: string;
  proficiency: number | null;
  displayOrder: number;
};

export function SkillsEditor({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function setRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function persist(index: number) {
    const row = rows[index];
    if (!row.label.trim()) return;
    setPendingId(row.id ?? `new-${index}`);
    const res = await saveSkill({
      id: row.id,
      label: row.label,
      iconName: row.iconName,
      category: row.category,
      proficiency: row.proficiency ?? undefined,
      displayOrder: row.displayOrder,
    });
    if (!res.ok) {
      toast.error(res.error ?? "Save failed");
    } else {
      if (!row.id) setRow(index, { id: res.id });
      toast.success("Saved");
    }
    setPendingId(null);
  }

  async function remove(index: number) {
    const row = rows[index];
    if (row.id && !confirm(`Delete "${row.label}"?`)) return;
    if (row.id) await deleteSkill(row.id);
    setRows((prev) => prev.filter((_, i) => i !== index));
    toast.success("Deleted");
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { label: "", iconName: "", category: "", proficiency: null, displayOrder: prev.length },
    ]);
  }

  async function onDrop(targetIndex: number) {
    if (draggingIndex === null || draggingIndex === targetIndex) return;
    const reordered = [...rows];
    const [moved] = reordered.splice(draggingIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setRows(reordered.map((r, i) => ({ ...r, displayOrder: i })));
    setDraggingIndex(null);
    const ids = reordered.map((r) => r.id).filter(Boolean) as string[];
    if (ids.length > 0) {
      await reorderSkills(ids);
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
              onChange={(e) => setRow(i, { label: e.target.value })}
              placeholder="Skill (e.g. Python)"
              className="flex-1"
              onBlur={() => persist(i)}
            />
            <Input
              value={row.iconName}
              onChange={(e) => setRow(i, { iconName: e.target.value })}
              placeholder="icon slug"
              className="w-32"
              onBlur={() => persist(i)}
            />
            <Input
              value={row.category}
              onChange={(e) => setRow(i, { category: e.target.value })}
              placeholder="Category"
              className="w-40"
              onBlur={() => persist(i)}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete"
              onClick={() => remove(i)}
              disabled={pendingId !== null}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>

      <Button variant="outline" onClick={addRow}>
        <Plus className="mr-1 size-4" /> Add skill
      </Button>
    </div>
  );
}
