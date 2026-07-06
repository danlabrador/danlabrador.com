"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Trash2, Mail } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import {
  deleteSubmission,
  markSubmissionRead,
} from "@/app/admin/submissions/actions";

type Submission = {
  id: string;
  name: string;
  email: string;
  message: string;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
  submittedAt: string;
  readAt: string | null;
};

export function SubmissionsList({ initial }: { initial: Submission[] }) {
  const [items, setItems] = useState(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function toggleRead(id: string, read: boolean) {
    await markSubmissionRead(id, read);
    setItems((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, readAt: read ? new Date().toISOString() : null } : s,
      ),
    );
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await deleteSubmission(id);
    setItems((prev) => prev.filter((s) => s.id !== id));
    toast.success("Deleted");
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
        No messages yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {items.map((s) => {
        const isRead = Boolean(s.readAt);
        const isOpen = expandedId === s.id;
        return (
          <li key={s.id} className="py-3">
            <button
              type="button"
              onClick={() => {
                setExpandedId(isOpen ? null : s.id);
                if (!isRead) toggleRead(s.id, true);
              }}
              className="flex w-full items-baseline justify-between gap-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={
                      isRead
                        ? "truncate text-sm text-muted-foreground"
                        : "truncate text-sm font-semibold"
                    }
                  >
                    {s.name} — {s.email}
                  </p>
                  {!isRead && <Badge className="text-[10px]">New</Badge>}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {s.message}
                </p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {formatDate(s.submittedAt)}
              </p>
            </button>

            {isOpen && (
              <div className="mt-3 space-y-3 rounded-lg border border-border/60 bg-card/40 p-4 text-sm">
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  {s.projectType && (
                    <p>
                      <span className="font-medium text-foreground">Type:</span> {s.projectType}
                    </p>
                  )}
                  {s.budget && (
                    <p>
                      <span className="font-medium text-foreground">Budget:</span> {s.budget}
                    </p>
                  )}
                  {s.timeline && (
                    <p>
                      <span className="font-medium text-foreground">Timeline:</span>{" "}
                      {s.timeline}
                    </p>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{s.message}</p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a
                    href={`mailto:${s.email}?subject=Re%3A%20your%20message`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <Mail className="mr-1 size-4" /> Reply
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRead(s.id, !isRead)}
                  >
                    <Check className="mr-1 size-4" />
                    {isRead ? "Mark unread" : "Mark read"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(s.id)}>
                    <Trash2 className="mr-1 size-4" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
