// Edge-safe auth config. Does NOT reference Prisma — imported by proxy.ts,
// which runs on the Edge Runtime. The full config (with the adapter) lives
// in auth.ts and is only imported by Node runtime code paths.

import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

function allowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/admin/signin",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      return allowlist().includes(email);
    },
    authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      const isSignIn = request.nextUrl.pathname === "/admin/signin";
      if (isAdmin && !isSignIn) return Boolean(auth?.user);
      return true;
    },
  },
};
