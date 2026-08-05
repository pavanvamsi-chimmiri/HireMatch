import { Briefcase, FileSearch, TrendingUp, Users } from "lucide-react";
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

export default async function HRDashboardPage() {
  const user = await requireRole("HR");

  const stats = [
    {
      title: "Active Jobs",
      value: "0",
      description: "Open positions",
      icon: Briefcase,
    },
    {
      title: "Candidates",
      value: "0",
      description: "In your pipeline",
      icon: Users,
    },
    {
      title: "AI Matches",
      value: "0",
      description: "This week",
      icon: FileSearch,
    },
    {
      title: "Avg. Match Score",
      value: "—",
      description: "Across all roles",
      icon: TrendingUp,
    },
  ];

  return (
    <DashboardShell
      user={user}
      title={`Welcome, ${user.name ?? "HR Manager"}`}
      description="Manage job postings, review AI-matched candidates, and track your hiring pipeline."
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
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Start building your recruitment workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5 p-4">
              <p className="font-medium">Post a new job</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Create a job listing and let AI match candidates automatically.
              </p>
            </div>
            <div className="rounded-lg border border-dashed p-4">
              <p className="font-medium">Review candidate pipeline</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Screen applicants with AI-powered scoring and summaries.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest hiring updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
              No activity yet. Post your first job to get started.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
