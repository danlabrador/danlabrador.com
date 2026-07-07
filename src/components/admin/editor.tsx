"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useRef, useState } from "react";
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
  // Cursor position captured when the picker opens — the editor blurs
  // while the dialog is up, so we need this to insert at the right spot.
  const savedRange = useRef<{ from: number; to: number } | null>(null);

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

  const openPicker = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      savedRange.current = { from, to };
    }
    setPickerOpen(true);
  };

  const insertImage = (asset: MediaAssetSummary) => {
    if (!editor) return;
    const src = asset.url;
    if (!src) return;
    const alt = asset.altText ?? "";

    const at = savedRange.current ?? {
      from: editor.state.doc.content.size,
      to: editor.state.doc.content.size,
    };

    editor
      .chain()
      .focus()
      .insertContentAt(at, {
        type: "image",
        attrs: { src, alt },
      })
      .run();
  };

  return (
    <div className={cn("rounded-lg border border-border/60 bg-card/40", className)}>
      <EditorToolbar editor={editor} onInsertImage={openPicker} />
      <EditorContent editor={editor} />
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(asset) => {
          insertImage(asset);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
