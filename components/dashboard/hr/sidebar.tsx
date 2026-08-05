"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { hrNavItems } from "@/lib/hr/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type HRSidebarProps = {
  onNavigate?: () => void;
};

export function HRSidebar({ onNavigate }: HRSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-border/40 border-b px-6 py-5">
        <Link
          href="/dashboard/hr"
          className="flex items-center gap-2.5"
          onClick={onNavigate}
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/20">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold">{APP_NAME}</span>
            <Badge
              variant="secondary"
              className="mt-0.5 block w-fit text-[10px]"
            >
              HR
            </Badge>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {hrNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard/hr/jobs/new"
                ? pathname === "/dashboard/hr/jobs/new"
                : item.href === "/dashboard/hr/jobs"
                  ? pathname.startsWith("/dashboard/hr/jobs") &&
                    pathname !== "/dashboard/hr/jobs/new"
                  : pathname === item.href ||
                    (item.href !== "/dashboard/hr" &&
                      pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/10 to-cyan-600/10 text-blue-700 shadow-sm dark:text-blue-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive && "text-blue-600 dark:text-cyan-400",
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
