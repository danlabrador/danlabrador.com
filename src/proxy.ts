// Next.js 16 renamed middleware.ts → proxy.ts. Uses the edge-safe auth
// config only (no Prisma imports) so it runs on the Edge Runtime.

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: proxy } = NextAuth(authConfig);

export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
