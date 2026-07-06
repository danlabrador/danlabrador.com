// Estimate reading time from a Tiptap JSON doc.
// Extracts every text node and divides by an average WPM.

const WPM = 220;

type Node = {
  type?: string;
  text?: string;
  content?: Node[];
};

function collectText(node: Node | null | undefined, out: string[]) {
  if (!node) return;
  if (typeof node.text === "string") out.push(node.text);
  if (Array.isArray(node.content)) {
    for (const child of node.content) collectText(child, out);
  }
}

export function readingTimeMinutes(doc: unknown): number {
  const words: string[] = [];
  collectText(doc as Node, words);
  const total = words.join(" ").trim().split(/\s+/).filter(Boolean).length;
  if (total === 0) return 1;
  return Math.max(1, Math.round(total / WPM));
}

export function excerptFromDoc(doc: unknown, maxChars = 220): string {
  const parts: string[] = [];
  collectText(doc as Node, parts);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
}
