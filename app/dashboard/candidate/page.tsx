import { Bookmark, ClipboardList, Search, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CandidateDashboardPage() {
  const user = await requireRole("CANDIDATE");

  const stats = [
    {
      title: "Applications",
      value: "0",
      description: "Submitted",
      icon: ClipboardList,
    },
    {
      title: "Saved Jobs",
      value: "0",
      description: "Bookmarked roles",
      icon: Bookmark,
    },
    {
      title: "AI Match Score",
      value: "—",
      description: "Average fit",
      icon: Sparkles,
    },
    {
      title: "Interviews",
      value: "0",
      description: "Scheduled",
      icon: Search,
    },
  ];

  return (
    <DashboardShell
      user={user}
      title={`Welcome, ${user.name ?? "Candidate"}`}
      description="Discover AI-matched job opportunities and track your applications."
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <CardDescription className="mt-1">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>
              AI-matched roles based on your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
              Complete your profile to unlock personalized job matches.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Track where you stand in the hiring process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
              No applications yet. Browse jobs to get started.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
