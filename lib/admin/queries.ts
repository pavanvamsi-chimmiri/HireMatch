import type { ApplicationStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AdminAnalyticsData,
  AdminApplicationRow,
  AdminCandidateRow,
  AdminDashboardData,
  AdminHRRow,
  AdminJobRow,
  AdminMonthlyTrend,
  AdminReportsData,
  AdminSystemSetting,
  AdminUserRow,
} from "@/types/admin";

function buildLastSixMonthBuckets() {
  const buckets: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
    });
  }

  return buckets;
}

function getMonthlyTrends(
  users: Array<{ createdAt: Date }>,
  applications: Array<{ appliedAt: Date }>,
  jobs: Array<{ createdAt: Date }>,
): AdminMonthlyTrend[] {
  const buckets = buildLastSixMonthBuckets();

  return buckets.map(({ key, label }) => ({
    month: label,
    users: users.filter((user) => {
      const userKey = `${user.createdAt.getFullYear()}-${user.createdAt.getMonth()}`;
      return userKey === key;
    }).length,
    applications: applications.filter((application) => {
      const appKey = `${application.appliedAt.getFullYear()}-${application.appliedAt.getMonth()}`;
      return appKey === key;
    }).length,
    jobs: jobs.filter((job) => {
      const jobKey = `${job.createdAt.getFullYear()}-${job.createdAt.getMonth()}`;
      return jobKey === key;
    }).length,
  }));
}

function formatStatusLabel(status: ApplicationStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    users,
    jobs,
    applications,
    companies,
    recentUsers,
    recentApplications,
    recentJobs,
  ] = await Promise.all([
    prisma.user.findMany({
      select: { role: true, isActive: true },
    }),
    prisma.job.findMany({
      select: { status: true },
    }),
    prisma.application.findMany({
      select: { status: true, aiScore: true },
    }),
    prisma.company.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        _count: {
          select: {
            applications: true,
            jobs: true,
            resumes: true,
          },
        },
      },
    }),
    prisma.application.findMany({
      orderBy: { appliedAt: "desc" },
      take: 8,
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    }),
    prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        company: { select: { name: true } },
        postedBy: { select: { name: true, email: true } },
        _count: { select: { applications: true } },
      },
    }),
  ]);

  const scoredApplications = applications.filter((app) => app.aiScore !== null);
  const avgMatchScore =
    scoredApplications.length > 0
      ? scoredApplications.reduce((sum, app) => sum + (app.aiScore ?? 0), 0) /
        scoredApplications.length
      : null;

  return {
    stats: {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive).length,
      hrUsers: users.filter((user) => user.role === "HR").length,
      candidates: users.filter((user) => user.role === "CANDIDATE").length,
      totalJobs: jobs.length,
      openJobs: jobs.filter((job) => job.status === "OPEN").length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(
        (app) => app.status === "PENDING",
      ).length,
      companies,
      avgMatchScore,
    },
    recentUsers: recentUsers as AdminUserRow[],
    recentApplications: recentApplications as AdminApplicationRow[],
    recentJobs: recentJobs as AdminJobRow[],
  };
}

export async function getAdminUsers(search?: string): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          applications: true,
          jobs: true,
          resumes: true,
        },
      },
    },
  });

  return users as AdminUserRow[];
}

export async function getAdminHRUsers(search?: string): Promise<AdminHRRow[]> {
  const users = await prisma.user.findMany({
    where: {
      role: "HR",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      hrProfile: {
        include: {
          company: { select: { name: true } },
        },
      },
      _count: { select: { jobs: true } },
    },
  });

  return users as AdminHRRow[];
}

export async function getAdminCandidates(
  search?: string,
): Promise<AdminCandidateRow[]> {
  const users = await prisma.user.findMany({
    where: {
      role: "CANDIDATE",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      candidateProfile: {
        select: {
          headline: true,
          location: true,
          experienceYears: true,
          skills: true,
        },
      },
      _count: {
        select: {
          applications: true,
          resumes: true,
        },
      },
    },
  });

  return users as AdminCandidateRow[];
}

export async function getAdminJobs(search?: string): Promise<AdminJobRow[]> {
  const jobs = await prisma.job.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { company: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      postedBy: { select: { name: true, email: true } },
      _count: { select: { applications: true } },
    },
  });

  return jobs as AdminJobRow[];
}

export async function getAdminApplications(
  search?: string,
): Promise<AdminApplicationRow[]> {
  const applications = await prisma.application.findMany({
    where: search
      ? {
          OR: [
            {
              candidate: {
                name: { contains: search, mode: "insensitive" },
              },
            },
            {
              candidate: {
                email: { contains: search, mode: "insensitive" },
              },
            },
            { job: { title: { contains: search, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { appliedAt: "desc" },
    include: {
      candidate: {
        select: { id: true, name: true, email: true },
      },
      job: {
        select: {
          id: true,
          title: true,
          company: { select: { name: true } },
        },
      },
    },
  });

  return applications as AdminApplicationRow[];
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  const [users, jobs, applications, companies] = await Promise.all([
    prisma.user.findMany({
      select: { role: true, createdAt: true },
    }),
    prisma.job.findMany({
      select: {
        status: true,
        createdAt: true,
        title: true,
        company: { select: { name: true } },
      },
    }),
    prisma.application.findMany({
      select: { status: true, appliedAt: true, jobId: true },
    }),
    prisma.company.count(),
  ]);

  const roleDistribution = (["ADMIN", "HR", "CANDIDATE"] as UserRole[])
    .map((role) => ({
      role,
      count: users.filter((user) => user.role === role).length,
    }))
    .filter((entry) => entry.count > 0);

  const statusMap = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ApplicationStatus, number>,
  );

  const applicationStatuses = Object.entries(statusMap).map(
    ([status, count]) => ({
      status: formatStatusLabel(status as ApplicationStatus),
      count,
    }),
  );

  const applicationsByJob = await prisma.application.groupBy({
    by: ["jobId"],
    _count: { _all: true },
    orderBy: { _count: { jobId: "desc" } },
    take: 8,
  });

  const topJobIds = applicationsByJob.map((entry) => entry.jobId);
  const topJobDetails = await prisma.job.findMany({
    where: { id: { in: topJobIds } },
    include: { company: { select: { name: true } } },
  });

  const topJobs = applicationsByJob
    .map((entry) => {
      const job = topJobDetails.find((detail) => detail.id === entry.jobId);
      if (!job) return null;
      return {
        jobTitle: job.title,
        company: job.company.name,
        count: entry._count._all,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return {
    summary: {
      users: users.length,
      hrUsers: users.filter((user) => user.role === "HR").length,
      candidates: users.filter((user) => user.role === "CANDIDATE").length,
      jobs: jobs.length,
      openJobs: jobs.filter((job) => job.status === "OPEN").length,
      applications: applications.length,
      shortlisted: applications.filter((app) => app.status === "SHORTLISTED")
        .length,
      rejected: applications.filter((app) => app.status === "REJECTED").length,
      selected: applications.filter((app) => app.status === "OFFERED").length,
      companies,
    },
    monthlyTrends: getMonthlyTrends(users, applications, jobs),
    roleDistribution,
    applicationStatuses,
    topJobs,
  };
}

export async function getAdminReports(): Promise<AdminReportsData> {
  const analytics = await getAdminAnalytics();
  const [emails, notifications, resumes] = await Promise.all([
    prisma.email.count(),
    prisma.notification.count(),
    prisma.resume.count(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: "platform-overview",
        title: "Platform Overview",
        description: "High-level counts across users, jobs, and applications.",
        metrics: [
          { label: "Total Users", value: analytics.summary.users },
          { label: "HR Users", value: analytics.summary.hrUsers },
          { label: "Candidates", value: analytics.summary.candidates },
          { label: "Companies", value: analytics.summary.companies },
          { label: "Jobs", value: analytics.summary.jobs },
          { label: "Open Jobs", value: analytics.summary.openJobs },
          { label: "Applications", value: analytics.summary.applications },
        ],
      },
      {
        id: "hiring-pipeline",
        title: "Hiring Pipeline",
        description: "Application outcomes across the platform.",
        metrics: [
          { label: "Shortlisted", value: analytics.summary.shortlisted },
          { label: "Rejected", value: analytics.summary.rejected },
          { label: "Selected", value: analytics.summary.selected },
          {
            label: "Conversion Rate",
            value:
              analytics.summary.applications > 0
                ? `${Math.round((analytics.summary.selected / analytics.summary.applications) * 100)}%`
                : "0%",
          },
        ],
      },
      {
        id: "engagement",
        title: "Engagement & Content",
        description: "Resume uploads, notifications, and email activity.",
        metrics: [
          { label: "Resumes", value: resumes },
          { label: "Notifications", value: notifications },
          { label: "Emails Sent", value: emails },
        ],
      },
      {
        id: "top-jobs",
        title: "Most Applied Jobs",
        description: "Roles receiving the highest application volume.",
        metrics: analytics.topJobs.slice(0, 5).map((job) => ({
          label: `${job.jobTitle} (${job.company})`,
          value: job.count,
        })),
      },
    ],
  };
}

export async function getAdminSettings(): Promise<AdminSystemSetting[]> {
  const settings = await prisma.setting.findMany({
    where: { scope: "SYSTEM" },
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });

  return settings.map((setting) => ({
    id: setting.id,
    category: setting.category,
    key: setting.key,
    value: setting.value,
    updatedAt: setting.updatedAt,
  }));
}
