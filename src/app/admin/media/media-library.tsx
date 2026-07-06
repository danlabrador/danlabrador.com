"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MediaUploader } from "@/components/admin/media-uploader";
import type { MediaAssetSummary } from "@/lib/admin/media";

export function MediaLibrary({ initial }: { initial: MediaAssetSummary[] }) {
  const [assets, setAssets] = useState(initial);

  async function remove(id: string) {
    if (!confirm("Delete this file? This can't be undone.")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    setAssets((prev) => prev.filter((a) => a.id !== id));
    toast.success("Deleted");
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {assets.length} file{assets.length === 1 ? "" : "s"}
        </p>
        <MediaUploader
          onUploaded={(asset) => setAssets((prev) => [asset, ...prev])}
        />
      </div>

      {assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
          No files yet. Upload one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative aspect-square overflow-hidden rounded-md border border-border/60 bg-muted"
            >
              {asset.mimeType.startsWith("image/") ? (
                <Image
                  src={asset.url}
                  alt={asset.altText ?? ""}
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                  {asset.mimeType}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-[10px] text-white hover:underline"
                >
                  Open
                </a>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete"
                  onClick={() => remove(asset.id)}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
