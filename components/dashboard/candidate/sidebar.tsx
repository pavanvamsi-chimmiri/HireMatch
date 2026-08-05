"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { candidateNavItems } from "@/lib/candidate/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type CandidateSidebarProps = {
  unreadNotifications?: number;
  onNavigate?: () => void;
};

export function CandidateSidebar({
  unreadNotifications = 0,
  onNavigate,
}: CandidateSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-border/40 border-b px-6 py-5">
        <Link
          href="/dashboard/candidate"
          className="flex items-center gap-2.5"
          onClick={onNavigate}
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold">{APP_NAME}</span>
            <Badge
              variant="secondary"
              className="mt-0.5 block w-fit text-[10px]"
            >
              Candidate
            </Badge>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {candidateNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/candidate" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-700 shadow-sm dark:text-violet-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive && "text-violet-600 dark:text-violet-400",
                  )}
                />
                <span className="flex-1">{item.title}</span>
                {item.title === "Notifications" && unreadNotifications > 0 && (
                  <Badge className="size-5 justify-center rounded-full bg-violet-600 p-0 text-[10px] text-white">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
