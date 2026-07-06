import { generateHTML } from "@tiptap/html";
import { tiptapExtensions } from "@/lib/tiptap/extensions";
import { cn } from "@/lib/utils";

export function TiptapContent({
  json,
  className,
}: {
  json: unknown;
  className?: string;
}) {
  if (!json || typeof json !== "object") return null;
  let html: string;
  try {
    html = generateHTML(json as never, tiptapExtensions);
  } catch {
    return null;
  }
  return (
    <div
      className={cn("prose-content", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
