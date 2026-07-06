import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/section-header";
import { getUses } from "@/lib/content";

export const metadata: Metadata = {
  title: "Uses",
  description: "The tools, hardware, and software I use day-to-day.",
};

export default async function UsesPage() {
  const uses = await getUses();
  const byCategory = uses.reduce<Record<string, typeof uses>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <Container className="py-20">
      <header className="max-w-2xl">
        <p className="mb-3 text-sm text-muted-foreground">Uses</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Tools I use every day.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The hardware and software I reach for. Not a manifesto — just what
          works for me right now.
        </p>
      </header>

      <div className="mt-16 space-y-14">
        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category}>
            <SectionHeader title={category} />
            <ul className="divide-y divide-border/60">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-1 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline decoration-muted-foreground/40 underline-offset-4"
                        >
                          {item.label} <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        item.label
                      )}
                    </p>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
