"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import {
  deleteResume,
  makeResumeCurrent,
  registerResume,
} from "@/app/admin/resume/actions";

type Resume = {
  id: string;
  fileUrl: string;
  r2Key: string;
  versionLabel: string;
  isCurrent: boolean;
  uploadedAt: string;
};

export function ResumeEditor({ initial }: { initial: Resume[] }) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initial);
  const [versionLabel, setVersionLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF.");
      return;
    }
    setUploading(true);
    try {
      const presign = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mimeType: file.type, size: file.size, filename: file.name }),
      });
      if (!presign.ok) throw new Error(await presign.text());
      const { uploadUrl, publicUrl, r2Key } = (await presign.json()) as {
        uploadUrl: string;
        publicUrl: string;
        r2Key: string;
      };
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("Upload to R2 failed");

      const res = await registerResume({
        fileUrl: publicUrl,
        r2Key,
        versionLabel: versionLabel.trim() || undefined,
      });
      if (!res.ok) throw new Error(res.error);
      toast.success("Resume uploaded");
      setVersionLabel("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function makeCurrent(id: string) {
    await makeResumeCurrent(id);
    setResumes((prev) => prev.map((r) => ({ ...r, isCurrent: r.id === id })));
    toast.success("Set as current");
  }

  async function remove(id: string) {
    if (!confirm("Delete this resume version?")) return;
    await deleteResume(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Version label (optional, e.g. 'v3 – Nov 2026')"
            value={versionLabel}
            onChange={(e) => setVersionLabel(e.target.value)}
          />
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <UploadCloud className="mr-1 size-4" />
            {uploading ? "Uploading…" : "Upload PDF"}
          </Button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
          No resume uploaded yet.
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {resumes.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">
                    {r.versionLabel || "Unlabeled version"}
                  </p>
                  {r.isCurrent && (
                    <Badge className="text-[10px]">
                      <CheckCircle2 className="mr-1 size-3" /> Current
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Uploaded {formatDate(r.uploadedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={r.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Open <ExternalLink className="size-3" />
                </Link>
                {!r.isCurrent && (
                  <Button variant="ghost" size="sm" onClick={() => makeCurrent(r.id)}>
                    Set current
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => remove(r.id)}
                  disabled={r.isCurrent}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
