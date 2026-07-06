import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  title,
  href,
  hrefLabel,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {hrefLabel ?? "View all"} <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}
