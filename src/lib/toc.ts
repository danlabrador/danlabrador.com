export type TocItem = { depth: 2 | 3; text: string; id: string };

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
