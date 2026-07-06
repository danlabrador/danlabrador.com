import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ContactForm } from "@/components/contact-form";
import { getContactLinks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — for work, questions, or just to say hi.",
};

export default async function ContactPage() {
  const links = await getContactLinks();
  return (
    <Container className="py-20">
      <header className="max-w-2xl">
        <p className="mb-3 text-sm text-muted-foreground">Contact</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Let&rsquo;s talk.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          For work, questions, or just to say hi. I read every message and
          try to reply within a few days.
        </p>
        <ul className="mt-6 flex flex-wrap gap-4 text-sm">
          {links.map((link) => (
            <li key={link.id}>
              <Link
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </header>

      <ContactForm />
    </Container>
  );
}
