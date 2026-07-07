"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [expanded, setExpanded] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    // Show Turnstile on first submit attempt if we haven't already.
    if (TURNSTILE_SITE_KEY && !expanded) {
      setExpanded(true);
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error("Please complete the verification.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed");
      }
      toast.success("Check your inbox to confirm.");
      setEmail("");
      setExpanded(false);
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't subscribe.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className="sm:flex-1"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>
      {TURNSTILE_SITE_KEY && expanded && (
        <Turnstile
          ref={turnstileRef}
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
          options={{ theme: "auto", size: "compact" }}
        />
      )}
    </form>
  );
}
