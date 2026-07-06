"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  FolderKanban,
  Sparkles,
  Briefcase,
  GraduationCap,
  MessageSquareQuote,
  Link as LinkIcon,
  UserRound,
  Compass,
  Wrench,
  FileUp,
  Images,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon };
type Group = { label: string; items: Item[] };

const GROUPS: Group[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: Home }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/posts", label: "Blog posts", icon: FileText },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/about", label: "About + hero", icon: UserRound },
      { href: "/admin/now", label: "Now page", icon: Compass },
      { href: "/admin/uses", label: "Uses", icon: Wrench },
    ],
  },
  {
    label: "Homepage",
    items: [
      { href: "/admin/skills", label: "Skills", icon: Sparkles },
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/education", label: "Education", icon: GraduationCap },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/contact-links", label: "Contact links", icon: LinkIcon },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/media", label: "Media library", icon: Images },
      { href: "/admin/resume", label: "Resume", icon: FileUp },
      { href: "/admin/submissions", label: "Inbox", icon: Inbox },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 p-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      active && "bg-muted text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
