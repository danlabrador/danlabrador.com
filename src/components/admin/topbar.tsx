import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminTopbar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/60 px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
          target="_blank"
          rel="noopener noreferrer"
        >
          View site <ArrowUpRight className="ml-1 size-3.5" />
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar className="size-6">
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback>{(user.name ?? user.email ?? "?").slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/signin" });
          }}
        >
          <Button variant="ghost" size="icon" aria-label="Sign out" type="submit">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
