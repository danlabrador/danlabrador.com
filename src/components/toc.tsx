"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        On this page
      </p>
      <ol className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className={cn(item.depth === 3 && "pl-4")}>
            <Link
              href={`#${item.id}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
