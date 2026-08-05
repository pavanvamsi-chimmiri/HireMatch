"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { adminNavItems } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type AdminSidebarProps = {
  onNavigate?: () => void;
};

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-border/40 border-b px-6 py-5">
        <Link
          href="/dashboard/admin"
          className="flex items-center gap-2.5"
          onClick={onNavigate}
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Shield className="size-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold">{APP_NAME}</span>
            <Badge
              variant="secondary"
              className="mt-0.5 block w-fit text-[10px]"
            >
              Admin
            </Badge>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard/admin"
                ? pathname === "/dashboard/admin"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-amber-500/10 to-orange-600/10 text-amber-800 shadow-sm dark:text-amber-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive && "text-amber-600 dark:text-orange-400",
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
