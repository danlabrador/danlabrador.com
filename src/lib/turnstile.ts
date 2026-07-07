import { env } from "@/lib/env";

/**
 * Verify a Cloudflare Turnstile token against Cloudflare's siteverify API.
 * Returns true if the token is valid.
 */
export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  if (!token) return false;
  const secret = env.TURNSTILE_SECRET_KEY();
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );
  if (!res.ok) return false;
  const json = (await res.json()) as { success: boolean };
  return json.success === true;
}
