import Link from "next/link";
import {
  Briefcase,
  ClipboardList,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type HRStatCardsProps = {
  stats: {
    activeJobs: number;
    totalApplicants: number;
    activeApplicants: number;
    avgMatchScore: number | null;
    interviews: number;
    shortlisted: number;
  };
};

export function HRStatCards({ stats }: HRStatCardsProps) {
  const cards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs.toString(),
      description: "Open positions",
      icon: Briefcase,
      href: "/dashboard/hr/jobs",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Applicants",
      value: stats.totalApplicants.toString(),
      description: `${stats.activeApplicants} in pipeline`,
      icon: Users,
      href: "/dashboard/hr/applicants",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Avg Match Score",
      value: stats.avgMatchScore !== null ? `${stats.avgMatchScore}%` : "—",
      description: "AI fit across roles",
      icon: Sparkles,
      href: "/dashboard/hr/analytics",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Interviews",
      value: stats.interviews.toString(),
      description: `${stats.shortlisted} shortlisted`,
      icon: TrendingUp,
      href: "/dashboard/hr/applicants",
      color: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.title} href={card.href}>
          <Card className="border-border/50 transition-all hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`size-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <CardDescription className="mt-1">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  REVIEWING: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  SHORTLISTED: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  INTERVIEW: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  OFFERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-300",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

type RecentApplicantsProps = {
  applications: {
    id: string;
    status: string;
    aiScore: number | null;
    appliedAt: Date;
    candidate: { name: string | null; email: string };
    job: { title: string; company: { name: string } };
  }[];
};

export function RecentApplicants({ applications }: RecentApplicantsProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Applicants</CardTitle>
          <CardDescription>Latest candidates across your jobs</CardDescription>
        </div>
        <Link
          href="/dashboard/hr/applicants"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-cyan-400"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
            <ClipboardList className="size-8 opacity-40" />
            <p className="text-sm">No applicants yet</p>
            <Link
              href="/dashboard/hr/jobs/new"
              className="text-sm text-blue-600 hover:underline dark:text-cyan-400"
            >
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="border-border/50 hover:bg-muted/30 flex items-center justify-between rounded-xl border p-4 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {app.candidate.name ?? app.candidate.email}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {app.job.title} · {app.job.company.name}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  {app.aiScore !== null && (
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {Math.round(app.aiScore)}%
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[app.status] ?? statusStyles.PENDING}`}
                  >
                    {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type ActiveJobsPreviewProps = {
  jobs: {
    id: string;
    title: string;
    status: string;
    location: string | null;
    isRemote: boolean;
    _count: { applications: number };
    company: { name: string };
  }[];
};

const jobStatusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  OPEN: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export function ActiveJobsPreview({ jobs }: ActiveJobsPreviewProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Jobs</CardTitle>
          <CardDescription>
            Manage postings and applicant volume
          </CardDescription>
        </div>
        <Link
          href="/dashboard/hr/jobs"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-cyan-400"
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
            <Briefcase className="size-8 opacity-40" />
            <p className="text-sm">No jobs posted yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="border-border/50 hover:bg-muted/30 flex items-start gap-3 rounded-xl border p-4 transition-colors"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/10 to-cyan-600/10">
                  <Briefcase className="size-4 text-blue-600 dark:text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{job.title}</p>
                    <Badge
                      className={
                        jobStatusStyles[job.status] ?? jobStatusStyles.DRAFT
                      }
                    >
                      {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {job.company.name}
                    {job.isRemote
                      ? " · Remote"
                      : job.location
                        ? ` · ${job.location}`
                        : ""}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {job._count.applications} applicant
                    {job._count.applications === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type QuickActionsProps = {
  companyName?: string | null;
};

export function HRQuickActions({ companyName }: QuickActionsProps) {
  const actions = [
    {
      title: "Create Job",
      description:
        "Publish a new role and start receiving AI-matched applicants.",
      href: "/dashboard/hr/jobs/new",
      gradient: "from-blue-600/10 to-cyan-600/10 border-blue-500/20",
    },
    {
      title: "Search Candidates",
      description: "Find talent in your pipeline by skills, name, or email.",
      href: "/dashboard/hr/candidates",
      gradient: "from-indigo-600/10 to-violet-600/10 border-indigo-500/20",
    },
    {
      title: "Email Candidates",
      description: "Reach out to shortlisted or active applicants in bulk.",
      href: "/dashboard/hr/email",
      gradient: "from-emerald-600/10 to-teal-600/10 border-emerald-500/20",
    },
  ];

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/10 via-cyan-600/5 to-transparent px-6 py-5">
        <CardTitle className="text-base">Quick Actions</CardTitle>
        <CardDescription>
          {companyName
            ? `Hiring tools for ${companyName}`
            : "Jump into your recruitment workflow"}
        </CardDescription>
      </div>
      <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`rounded-xl border bg-gradient-to-br p-4 transition-all hover:shadow-md ${action.gradient}`}
          >
            <p className="font-medium">{action.title}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {action.description}
            </p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
