import { requireRole } from "@/lib/auth";
import { getCandidateNotifications } from "@/lib/candidate/queries";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";

export const dynamic = "force-dynamic";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  APPLICATION_UPDATE: ClipboardList,
  JOB_MATCH: Briefcase,
  INTERVIEW: MessageSquare,
  RANKING_UPDATE: Trophy,
  SYSTEM: Bell,
  MESSAGE: MessageSquare,
};

const typeColors: Record<string, string> = {
  APPLICATION_UPDATE: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  JOB_MATCH: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  INTERVIEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  RANKING_UPDATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  SYSTEM: "bg-muted text-muted-foreground",
  MESSAGE: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
};

export default async function NotificationsPage() {
  const user = await requireRole("CANDIDATE");

  let notifications: Awaited<ReturnType<typeof getCandidateNotifications>> = [];
  try {
    notifications = await getCandidateNotifications(user.id);
  } catch {
    notifications = [];
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated on your applications and job matches.
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-violet-600 text-white">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            {notifications.length} notification
            {notifications.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-16">
              <Bell className="size-10 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] ?? Sparkles;
                return (
                  <div
                    key={notification.id}
                    className={`flex gap-4 rounded-xl border p-4 transition-colors ${
                      notification.isRead
                        ? "border-border/50 opacity-70"
                        : "border-violet-500/20 bg-violet-500/5"
                    }`}
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${typeColors[notification.type] ?? typeColors.SYSTEM}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{notification.title}</p>
                        <time className="text-muted-foreground shrink-0 text-xs">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="mt-2 size-2 shrink-0 rounded-full bg-violet-600" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
