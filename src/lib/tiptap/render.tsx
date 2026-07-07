import { generateHTML } from "@tiptap/html";
import { tiptapExtensions } from "@/lib/tiptap/extensions";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/toc";

type MaybeNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: Array<{ type?: string; attrs?: { href?: unknown } }>;
  content?: MaybeNode[];
};

function textOf(node: MaybeNode): string {
  if (typeof node.text === "string") return node.text;
  if (!Array.isArray(node.content)) return "";
  return node.content.map(textOf).join("");
}

/**
 * Walk the Tiptap doc and drop any `link` marks that have no valid href.
 * Otherwise Tiptap emits `<a>` with no href attribute — a dead anchor that
 * looks like a link but isn't clickable.
 */
function stripBrokenLinks(node: MaybeNode): MaybeNode {
  if (Array.isArray(node.marks)) {
    node.marks = node.marks.filter((m) => {
      if (m.type !== "link") return true;
      const href = m.attrs?.href;
      return typeof href === "string" && href.length > 0;
    });
  }
  if (Array.isArray(node.content)) {
    node.content = node.content.map(stripBrokenLinks);
  }
  return node;
}

/**
 * Set an `id` attribute on every h2/h3 so TOC links can anchor to them.
 */
function addHeadingIds(node: MaybeNode): MaybeNode {
  if (node.type === "heading") {
    const level = (node.attrs as { level?: number } | undefined)?.level;
    if (level === 2 || level === 3) {
      const text = textOf(node).trim();
      if (text) node.attrs = { ...node.attrs, id: slugify(text) };
    }
  }
  if (Array.isArray(node.content)) node.content.forEach(addHeadingIds);
  return node;
}

export function TiptapContent({
  json,
  className,
}: {
  json: unknown;
  className?: string;
}) {
  if (!json || typeof json !== "object") return null;
  const cleaned = stripBrokenLinks(JSON.parse(JSON.stringify(json)) as MaybeNode);
  addHeadingIds(cleaned);
  let html: string;
  try {
    html = generateHTML(cleaned as never, tiptapExtensions);
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
