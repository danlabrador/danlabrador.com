import Link from "next/link";
import { Container } from "@/components/layout/container";
import { NewsletterForm } from "@/components/newsletter-form";
import { getContactLinks } from "@/lib/content";

export function SiteFooter() {
  const contactLinks = getContactLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60 py-12">
      <Container className="flex flex-col gap-10">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Newsletter</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Occasional notes on analytics engineering, tooling, and the
              craft of turning messy data into useful systems.
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Elsewhere</p>
            <ul className="mt-2 space-y-1.5">
              {contactLinks.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} Dan Labrador</p>
          <Link href="/rss.xml" className="hover:text-foreground">
            RSS
          </Link>
        </div>
      </Container>
    </footer>
  );
}
