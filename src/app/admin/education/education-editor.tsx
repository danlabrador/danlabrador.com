"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteEducation, saveEducation } from "@/app/admin/education/actions";

type Row = {
  id?: string;
  program: string;
  institution: string;
  startDate: string;
  endDate: string;
  displayOrder: number;
};

export function EducationEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);

  const set = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  async function persist(i: number) {
    const row = rows[i];
    if (!row.program.trim() || !row.institution.trim()) return;
    const res = await saveEducation({
      id: row.id,
      program: row.program,
      institution: row.institution,
      startDate: row.startDate || null,
      endDate: row.endDate || null,
      displayOrder: row.displayOrder,
    });
    if (!res.ok) return toast.error(res.error ?? "Save failed");
    if (!row.id) set(i, { id: res.id });
    toast.success("Saved");
  }

  async function remove(i: number) {
    const row = rows[i];
    if (row.id && !confirm(`Delete "${row.program} at ${row.institution}"?`)) return;
    if (row.id) await deleteEducation(row.id);
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {rows.map((row, i) => (
          <li
            key={row.id ?? `new-${i}`}
            className="space-y-3 rounded-lg border border-border/60 bg-card/40 p-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Program</Label>
                <Input
                  value={row.program}
                  onChange={(e) => set(i, { program: e.target.value })}
                  onBlur={() => persist(i)}
                />
              </div>
              <div className="space-y-1">
                <Label>Institution</Label>
                <Input
                  value={row.institution}
                  onChange={(e) => set(i, { institution: e.target.value })}
                  onBlur={() => persist(i)}
                />
              </div>
              <div className="space-y-1">
                <Label>Start</Label>
                <Input
                  type="date"
                  value={row.startDate}
                  onChange={(e) => set(i, { startDate: e.target.value })}
                  onBlur={() => persist(i)}
                />
              </div>
              <div className="space-y-1">
                <Label>End</Label>
                <Input
                  type="date"
                  value={row.endDate}
                  onChange={(e) => set(i, { endDate: e.target.value })}
                  onBlur={() => persist(i)}
                />
              </div>
            </div>
            <div className="flex justify-end">
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
              program: "",
              institution: "",
              startDate: "",
              endDate: "",
              displayOrder: prev.length,
            },
          ])
        }
      >
        <Plus className="mr-1 size-4" /> Add education
      </Button>
    </div>
  );
}
