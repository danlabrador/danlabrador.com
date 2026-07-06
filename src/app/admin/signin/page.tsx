import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/brand-icons";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user) redirect(callbackUrl ?? "/admin");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            danlabrador.com
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin access only. Sign in with GitHub — your account must be on the
            allowlist to continue.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: callbackUrl ?? "/admin" });
          }}
        >
          <Button type="submit" className="w-full" size="lg">
            <GitHubIcon className="size-4" /> Continue with GitHub
          </Button>
        </form>
      </div>
    </div>
  );
}
