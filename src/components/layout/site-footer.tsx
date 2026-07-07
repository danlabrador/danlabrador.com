import Link from "next/link";
import { Container } from "@/components/layout/container";
import { NewsletterForm } from "@/components/newsletter-form";
import { getContactLinks } from "@/lib/content";

export async function SiteFooter() {
  const contactLinks = await getContactLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-border/40 py-14">
      <Container className="flex flex-col gap-12">
        <div className="grid gap-12 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Newsletter
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Occasional notes on analytics engineering, tooling, and the craft
              of turning messy data into useful systems.
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Elsewhere
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
              {contactLinks.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground underline decoration-transparent underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-muted-foreground/60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} Dan Labrador. Built with Next.js.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/rss.xml"
              className="transition-colors hover:text-foreground"
            >
              RSS
            </Link>
            <Link
              href="/sitemap.xml"
              className="transition-colors hover:text-foreground"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
