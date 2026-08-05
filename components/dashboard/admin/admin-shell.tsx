"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { AdminSidebar } from "@/components/dashboard/admin/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { AuthUser } from "@/lib/auth";

type AdminShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

function getInitials(name: string | null | undefined) {
  if (!name) return "A";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-muted/20 flex min-h-screen">
      <aside className="border-border/40 bg-background/80 hidden w-64 shrink-0 border-r backdrop-blur-xl lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        <AdminSidebar />
        <div className="border-border/40 mt-auto border-t p-4">
          <div className="bg-muted/50 flex items-center gap-3 rounded-xl p-3">
            <Avatar className="size-9">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-amber-600/10 text-amber-700 dark:text-amber-300">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.name ?? "Admin"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="border-border/40 bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-xl sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="lg:hidden"
              render={<Button variant="ghost" size="icon" />}
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeToggle />
            <form action={signOutAction}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
