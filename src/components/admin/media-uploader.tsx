"use client";

import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MediaAssetSummary } from "@/lib/admin/media";

async function uploadFile(file: File): Promise<MediaAssetSummary> {
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

  const dims = file.type.startsWith("image/")
    ? await readImageDimensions(file).catch(() => undefined)
    : undefined;

  const registered = await fetch("/api/media/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: publicUrl,
      r2Key,
      mimeType: file.type,
      bytes: file.size,
      width: dims?.width,
      height: dims?.height,
    }),
  });
  if (!registered.ok) throw new Error(await registered.text());
  return (await registered.json()) as MediaAssetSummary;
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error("Could not read image"));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function MediaUploader({
  onUploaded,
  label = "Upload",
}: {
  onUploaded: (asset: MediaAssetSummary) => void;
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPending(true);
    try {
      for (const file of Array.from(files)) {
        const asset = await uploadFile(file);
        onUploaded(asset);
      }
      toast.success(files.length > 1 ? `${files.length} files uploaded` : "Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        <UploadCloud className="mr-1 size-4" />
        {pending ? "Uploading…" : label}
      </Button>
    </>
  );
}
