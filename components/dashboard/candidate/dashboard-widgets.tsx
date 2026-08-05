import Link from "next/link";
import {
  Bookmark,
  Briefcase,
  ClipboardList,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardsProps = {
  stats: {
    totalApplications: number;
    activeApplications: number;
    avgMatchScore: number | null;
    interviews: number;
    resumes: number;
    unreadNotifications: number;
  };
};

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: "Applications",
      value: stats.totalApplications.toString(),
      description: `${stats.activeApplications} active`,
      icon: ClipboardList,
      href: "/dashboard/candidate/applications",
      color: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Resumes",
      value: stats.resumes.toString(),
      description: "Uploaded files",
      icon: FileText,
      href: "/dashboard/candidate/resume",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Match Score",
      value: stats.avgMatchScore !== null ? `${stats.avgMatchScore}%` : "—",
      description: "Average fit score",
      icon: Sparkles,
      href: "/dashboard/candidate/jobs",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Interviews",
      value: stats.interviews.toString(),
      description: "Scheduled",
      icon: TrendingUp,
      href: "/dashboard/candidate/applications",
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.title} href={card.href}>
          <Card className="border-border/50 transition-all hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-500/5">
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

type RecentApplicationsProps = {
  applications: {
    id: string;
    status: string;
    aiScore: number | null;
    appliedAt: Date;
    job: {
      title: string;
      company: { name: string };
    };
  }[];
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  REVIEWING: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  SHORTLISTED: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  INTERVIEW: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  OFFERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-300",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest job applications</CardDescription>
        </div>
        <Link
          href="/dashboard/candidate/applications"
          className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
            <ClipboardList className="size-8 opacity-40" />
            <p className="text-sm">No applications yet</p>
            <Link
              href="/dashboard/candidate/jobs"
              className="text-sm text-violet-600 hover:underline dark:text-violet-400"
            >
              Browse recommended jobs
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
                  <p className="truncate font-medium">{app.job.title}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {app.job.company.name}
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

type RecommendedJobsPreviewProps = {
  jobs: {
    id: string;
    title: string;
    location: string | null;
    isRemote: boolean;
    salaryMin: number | null;
    salaryMax: number | null;
    company: { name: string };
  }[];
};

export function RecommendedJobsPreview({ jobs }: RecommendedJobsPreviewProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recommended Jobs</CardTitle>
          <CardDescription>Open roles matching your profile</CardDescription>
        </div>
        <Link
          href="/dashboard/candidate/jobs"
          className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
            <Briefcase className="size-8 opacity-40" />
            <p className="text-sm">No open jobs right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="border-border/50 hover:bg-muted/30 flex items-start gap-3 rounded-xl border p-4 transition-colors"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/10 to-indigo-600/10">
                  <Briefcase className="size-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{job.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {job.company.name}
                    {job.isRemote
                      ? " · Remote"
                      : job.location
                        ? ` · ${job.location}`
                        : ""}
                  </p>
                  {job.salaryMin && job.salaryMax && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      ${(job.salaryMin / 1000).toFixed(0)}k – $
                      {(job.salaryMax / 1000).toFixed(0)}k
                    </p>
                  )}
                </div>
                <Bookmark className="text-muted-foreground size-4 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
