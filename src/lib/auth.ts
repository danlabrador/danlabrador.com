import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

// JWT strategy — required when the edge proxy needs to check auth. The
// Prisma adapter still records User + Account rows (so we have a persistent
// user identity), but sessions live in a signed cookie, not the DB.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
});
