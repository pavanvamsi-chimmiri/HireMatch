"use client";

import Link from "next/link";
import {
  Briefcase,
  Building2,
  ClipboardList,
  Sparkles,
  UserCheck,
  UserCog,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AdminApplicationRow,
  AdminDashboardStats,
  AdminJobRow,
  AdminUserRow,
} from "@/types/admin";

type AdminStatCardsProps = {
  stats: AdminDashboardStats;
};

export function AdminStatCards({ stats }: AdminStatCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      description: `${stats.activeUsers} active`,
      icon: Users,
      href: "/dashboard/admin/users",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "HR Managers",
      value: stats.hrUsers.toString(),
      description: `${stats.companies} companies`,
      icon: UserCog,
      href: "/dashboard/admin/hr",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Candidates",
      value: stats.candidates.toString(),
      description: "Registered talent",
      icon: UserCheck,
      href: "/dashboard/admin/candidates",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Jobs",
      value: stats.totalJobs.toString(),
      description: `${stats.openJobs} open`,
      icon: Briefcase,
      href: "/dashboard/admin/jobs",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Applications",
      value: stats.totalApplications.toString(),
      description: `${stats.pendingApplications} pending`,
      icon: ClipboardList,
      href: "/dashboard/admin/applications",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Avg Match Score",
      value:
        stats.avgMatchScore !== null
          ? `${Math.round(stats.avgMatchScore)}%`
          : "—",
      description: "Platform AI fit",
      icon: Sparkles,
      href: "/dashboard/admin/analytics",
      color: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Link key={card.title} href={card.href}>
          <Card className="border-border/50 transition-all hover:border-amber-500/30 hover:shadow-md hover:shadow-amber-500/5">
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

const roleStyles: Record<string, string> = {
  ADMIN: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  HR: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  CANDIDATE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  REVIEWING: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  SHORTLISTED: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  INTERVIEW: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  OFFERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-300",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

const jobStatusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  OPEN: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export function AdminRecentUsers({ users }: { users: AdminUserRow[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Latest registrations across all roles</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No users yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name ?? user.email}</p>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleStyles[user.role] ?? roleStyles.HR}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "secondary" : "outline"}
                      className={
                        user.isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "text-muted-foreground"
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminRecentApplications({
  applications,
}: {
  applications: AdminApplicationRow[];
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>Latest hiring activity platform-wide</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No applications yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {application.candidate.name ??
                          application.candidate.email}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {application.candidate.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{application.job.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {application.job.company.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {application.aiScore !== null
                      ? `${Math.round(application.aiScore)}%`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusStyles[application.status] ?? statusStyles.PENDING
                      }
                    >
                      {application.status.charAt(0) +
                        application.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminRecentJobs({ jobs }: { jobs: AdminJobRow[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-4" />
          Recent Jobs
        </CardTitle>
        <CardDescription>Latest job postings across companies</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No jobs posted yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Posted By</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {job.company.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {job.postedBy.name ?? job.postedBy.email}
                    </p>
                  </TableCell>
                  <TableCell>{job._count.applications}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        jobStatusStyles[job.status] ?? jobStatusStyles.DRAFT
                      }
                    >
                      {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminQuickActions() {
  const actions = [
    {
      title: "Manage Users",
      href: "/dashboard/admin/users",
      description: "View and control all platform accounts",
    },
    {
      title: "View Analytics",
      href: "/dashboard/admin/analytics",
      description: "Platform-wide hiring metrics and trends",
    },
    {
      title: "Generate Reports",
      href: "/dashboard/admin/reports",
      description: "Export-ready platform summaries",
    },
    {
      title: "System Settings",
      href: "/dashboard/admin/settings",
      description: "Configure AI matching and platform defaults",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="border-border/50 h-full transition-all hover:border-amber-500/30 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
