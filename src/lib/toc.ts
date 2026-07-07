export type TocItem = { depth: 2 | 3; text: string; id: string };

type TiptapNode = {
  type?: string;
  attrs?: { level?: number };
  text?: string;
  content?: TiptapNode[];
};

function textOf(node: TiptapNode): string {
  if (typeof node.text === "string") return node.text;
  if (!Array.isArray(node.content)) return "";
  return node.content.map(textOf).join("");
}

export function extractTocFromTiptap(doc: unknown): TocItem[] {
  const items: TocItem[] = [];
  const root = doc as TiptapNode | null;
  if (!root || !Array.isArray(root.content)) return items;
  for (const node of root.content) {
    if (node.type !== "heading") continue;
    const level = node.attrs?.level;
    if (level !== 2 && level !== 3) continue;
    const text = textOf(node).trim();
    if (!text) continue;
    items.push({ depth: level, text, id: slugify(text) });
  }
  return items;
}

export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const codeFence = /^```/;
  let inCode = false;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trimEnd();
    if (codeFence.test(line.trim())) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const depth = match[1].length as 2 | 3;
    const text = match[2].replace(/[*_`]/g, "").trim();
    const id = slugify(text);
    items.push({ depth, text, id });
  }
  return items;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
