import Link from "next/link";
import { Sparkles } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/constants";
import type { AuthUser } from "@/lib/auth";

type DashboardShellProps = {
  user: AuthUser;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function DashboardShell({
  user,
  title,
  description,
  children,
}: DashboardShellProps) {
  const dashboardPath =
    user.role === "HR" ? "/dashboard/hr" : "/dashboard/candidate";

  return (
    <div className="bg-muted/20 min-h-screen">
      <header className="border-border/40 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={dashboardPath} className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="text-lg font-bold">{APP_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href={dashboardPath}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/profile?setup=true"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {user.role === "HR" ? "HR" : "Candidate"}
            </Badge>
            <ThemeToggle />
            <form action={signOutAction}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
