import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getResend } from "@/lib/resend";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
  projectType: z.string().max(50).optional(),
  budget: z.string().max(50).optional(),
  timeline: z.string().max(50).optional(),
  turnstileToken: z.string().min(1),
});

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  // Rate limit by IP: 3 submissions per hour.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many messages. Try again later." },
      { status: 429 },
    );
  }

  // Verify Turnstile.
  const ok = await verifyTurnstile(data.turnstileToken, ip);
  if (!ok) {
    return NextResponse.json({ error: "Verification failed." }, { status: 400 });
  }

  // Persist.
  const submission = await prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      message: data.message,
      projectType: data.projectType || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      ipHash: hashIp(ip),
      userAgent: req.headers.get("user-agent") ?? null,
    },
  });

  // Email via Resend (best-effort; don't fail the submission if it errors).
  try {
    const subject = `[danlabrador.com] ${data.name} — ${data.projectType ?? "inquiry"}`;
    const html = `
      <h2>New contact submission</h2>
      <p><strong>From:</strong> ${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</p>
      ${data.projectType ? `<p><strong>Project type:</strong> ${escapeHtml(data.projectType)}</p>` : ""}
      ${data.budget ? `<p><strong>Budget:</strong> ${escapeHtml(data.budget)}</p>` : ""}
      ${data.timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(data.timeline)}</p>` : ""}
      <hr />
      <p style="white-space: pre-wrap">${escapeHtml(data.message)}</p>
      <hr />
      <p style="color: #6b7280; font-size: 12px;">Submission ID: ${submission.id}</p>
    `;
    const result = await getResend().emails.send({
      from: env.RESEND_FROM(),
      to: env.CONTACT_INBOX(),
      replyTo: data.email,
      subject,
      html,
    });
    if (result.error) {
      console.error("[contact] Resend returned error:", JSON.stringify(result.error));
    } else {
      console.log("[contact] Resend sent:", result.data?.id);
    }
  } catch (err) {
    console.error("[contact] Resend threw:", err);
  }

  return NextResponse.json({ ok: true });
}
