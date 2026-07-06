import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { ContactLinksEditor } from "@/app/admin/contact-links/contact-links-editor";

export const dynamic = "force-dynamic";

export default async function ContactLinksPage() {
  await requireAdmin();
  const links = await prisma.contactLink.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Contact
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Contact links</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Links shown in the footer, /contact, and homepage.
        </p>
      </header>
      <ContactLinksEditor
        initial={links.map((l) => ({
          id: l.id,
          label: l.label,
          url: l.url,
          iconName: l.iconName ?? "",
          displayOrder: l.displayOrder,
        }))}
      />
    </div>
  );
}
