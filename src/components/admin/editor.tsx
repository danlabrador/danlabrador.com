"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useState } from "react";
import { tiptapExtensions } from "@/lib/tiptap/extensions";
import { EditorToolbar } from "@/components/admin/editor-toolbar";
import { MediaPicker } from "@/components/admin/media-picker";
import type { MediaAssetSummary } from "@/lib/admin/media";
import { cn } from "@/lib/utils";

export function TiptapEditor({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: unknown; // Tiptap JSON doc
  onChange: (json: unknown) => void;
  placeholder?: string;
  className?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: value ?? { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class: "prose-content min-h-[300px] px-4 py-4 focus:outline-none",
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    immediatelyRender: false,
  });

  const insertImage = (asset: MediaAssetSummary) => {
    editor
      ?.chain()
      .focus()
      .setImage({ src: asset.url, alt: asset.altText ?? "" })
      .run();
  };

  return (
    <div className={cn("rounded-lg border border-border/60 bg-card/40", className)}>
      <EditorToolbar editor={editor} onInsertImage={() => setPickerOpen(true)} />
      <EditorContent editor={editor} />
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(asset) => {
          setPickerOpen(false);
          insertImage(asset);
        }}
      />
    </div>
  );
}
