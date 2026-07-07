import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(200),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(`nl:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  // Turnstile is optional here since the footer form can render without it,
  // but if a token is provided we verify it.
  if (parsed.data.turnstileToken) {
    const ok = await verifyTurnstile(parsed.data.turnstileToken, ip);
    if (!ok) {
      return NextResponse.json({ error: "Verification failed." }, { status: 400 });
    }
  }

  const email = parsed.data.email.toLowerCase().trim();

  // Forward to Buttondown.
  let buttondownId: string | undefined;
  try {
    const res = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${env.BUTTONDOWN_API_KEY()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, type: "regular" }),
    });
    // 201 = created, 400 = already subscribed (treat both as success)
    if (res.ok) {
      const json = (await res.json()) as { id?: string };
      buttondownId = json.id;
    } else if (res.status !== 400) {
      const text = await res.text().catch(() => "");
      console.error("[newsletter] Buttondown error:", res.status, text);
      return NextResponse.json({ error: "Couldn't subscribe." }, { status: 502 });
    }
  } catch (err) {
    console.error("[newsletter] Buttondown fetch failed:", err);
    return NextResponse.json({ error: "Couldn't subscribe." }, { status: 502 });
  }

  // Mirror to DB.
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      buttondownId: buttondownId ?? null,
      status: "PENDING",
    },
    update: {
      buttondownId: buttondownId ?? undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
