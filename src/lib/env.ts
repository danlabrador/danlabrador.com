// Lenient env accessor. Modules that need a specific var (e.g. r2.ts, resend.ts)
// validate at their own point of use, so public pages can render even when
// third-party creds aren't set yet.

function get(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

function required(key: string): string {
  const value = get(key);
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const env = {
  DATABASE_URL: () => required("DATABASE_URL"),
  DIRECT_URL: () => get("DIRECT_URL"),

  AUTH_SECRET: () => required("AUTH_SECRET"),
  AUTH_URL: () => get("AUTH_URL"),
  AUTH_GITHUB_ID: () => required("AUTH_GITHUB_ID"),
  AUTH_GITHUB_SECRET: () => required("AUTH_GITHUB_SECRET"),
  ADMIN_EMAIL_ALLOWLIST: () => get("ADMIN_EMAIL_ALLOWLIST") ?? "",

  R2_ACCOUNT_ID: () => required("R2_ACCOUNT_ID"),
  R2_ACCESS_KEY_ID: () => required("R2_ACCESS_KEY_ID"),
  R2_SECRET_ACCESS_KEY: () => required("R2_SECRET_ACCESS_KEY"),
  R2_BUCKET_NAME: () => required("R2_BUCKET_NAME"),
  R2_PUBLIC_URL: () => required("R2_PUBLIC_URL"),

  RESEND_API_KEY: () => required("RESEND_API_KEY"),
  RESEND_FROM: () => required("RESEND_FROM"),
  CONTACT_INBOX: () => required("CONTACT_INBOX"),

  BUTTONDOWN_API_KEY: () => required("BUTTONDOWN_API_KEY"),

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: () =>
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  TURNSTILE_SECRET_KEY: () => required("TURNSTILE_SECRET_KEY"),

  NEXT_PUBLIC_SITE_URL: () =>
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export function adminEmailAllowlist(): string[] {
  return env
    .ADMIN_EMAIL_ALLOWLIST()
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
