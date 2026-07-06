"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaUploader } from "@/components/admin/media-uploader";
import type { MediaAssetSummary } from "@/lib/admin/media";

export function MediaPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (asset: MediaAssetSummary) => void;
}) {
  const [assets, setAssets] = useState<MediaAssetSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // Standard fetch-on-open pattern; the setState in effect body is intentional
    // and the alternative (deferred fetch) would flash empty content.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/media")
      .then((r) => r.json())
      .then((data: { assets: MediaAssetSummary[] }) => {
        if (!cancelled) setAssets(data.assets);
      })
      .catch(() => toast.error("Couldn't load media library"))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${assets.length} file${assets.length === 1 ? "" : "s"}`}
          </p>
          <MediaUploader
            onUploaded={(asset) => setAssets((prev) => [asset, ...prev])}
            label="Upload new"
          />
        </div>

        <div className="grid max-h-[420px] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onPick(asset)}
              className="group relative aspect-square overflow-hidden rounded-md border border-border/60 bg-muted transition-colors hover:border-border"
            >
              {asset.mimeType.startsWith("image/") ? (
                <Image
                  src={asset.url}
                  alt={asset.altText ?? ""}
                  fill
                  sizes="120px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                  {asset.mimeType}
                </div>
              )}
            </button>
          ))}
          {!loading && assets.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No files yet. Upload one to get started.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
