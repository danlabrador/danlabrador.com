"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { XIcon, LinkedInIcon, FacebookIcon } from "@/components/brand-icons";
import { toast } from "sonner";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shares = [
    {
      label: "X",
      href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: XIcon,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedInIcon,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
    },
  ] as const;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  return (
    <div className="flex items-center gap-1">
      {shares.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <Icon className="size-4" />
        </a>
      ))}
      <Button variant="ghost" size="icon" aria-label="Copy link" onClick={copy}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}
