"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  deleteExperience,
  saveExperience,
} from "@/app/admin/experience/actions";

type Row = {
  id?: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  displayOrder: number;
};

export function ExperienceEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);

  const set = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  async function persist(i: number) {
    const row = rows[i];
    if (!row.role.trim() || !row.company.trim() || !row.startDate) return;
    const res = await saveExperience({
      id: row.id,
      role: row.role,
      company: row.company,
      startDate: row.startDate,
      endDate: row.endDate || null,
      bullets: row.bullets.filter((b) => b.trim().length > 0),
      displayOrder: row.displayOrder,
    });
    if (!res.ok) return toast.error(res.error ?? "Save failed");
    if (!row.id) set(i, { id: res.id });
    toast.success("Saved");
  }

  async function remove(i: number) {
    const row = rows[i];
    if (row.id && !confirm(`Delete "${row.role} at ${row.company}"?`)) return;
    if (row.id) await deleteExperience(row.id);
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
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Role</Label>
                <Input
                  value={row.role}
                  onChange={(e) => set(i, { role: e.target.value })}
                  onBlur={() => persist(i)}
                />
              </div>
              <div className="space-y-1">
                <Label>Company</Label>
                <Input
                  value={row.company}
                  onChange={(e) => set(i, { company: e.target.value })}
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
                <Label>End (blank = current)</Label>
                <Input
                  type="date"
                  value={row.endDate}
                  onChange={(e) => set(i, { endDate: e.target.value })}
                  onBlur={() => persist(i)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Bullets (one per line)</Label>
              <Textarea
                value={row.bullets.join("\n")}
                onChange={(e) => set(i, { bullets: e.target.value.split(/\n+/) })}
                onBlur={() => persist(i)}
                rows={4}
              />
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
              role: "",
              company: "",
              startDate: new Date().toISOString().slice(0, 10),
              endDate: "",
              bullets: [],
              displayOrder: prev.length,
            },
          ])
        }
      >
        <Plus className="mr-1 size-4" /> Add role
      </Button>
    </div>
  );
}
