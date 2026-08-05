import type { ApplicationStatus, JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getMonthlyApplicationData(applications: { appliedAt: Date }[]) {
  const months: Record<string, number> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString("en-US", { month: "short" });
    months[key] = 0;
  }

  applications.forEach((app) => {
    const key = app.appliedAt.toLocaleDateString("en-US", { month: "short" });
    if (key in months) {
      months[key]++;
    }
  });

  return Object.entries(months).map(([month, count]) => ({ month, count }));
}

export async function getHRDashboardData(userId: string) {
  const [jobs, applications, hrProfile, rankings] = await Promise.all([
    prisma.job.findMany({
      where: { postedById: userId },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.application.findMany({
      where: { job: { postedById: userId } },
      include: {
        job: { include: { company: true } },
        candidate: { include: { candidateProfile: true } },
      },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.hRProfile.findUnique({
      where: { userId },
      include: { company: true },
    }),
    prisma.candidateRanking.findMany({
      where: { job: { postedById: userId } },
      include: {
        candidate: { include: { candidateProfile: true } },
        job: true,
      },
      orderBy: { score: "desc" },
      take: 10,
    }),
  ]);

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ApplicationStatus, number>,
  );

  const scoredApplications = applications.filter((app) => app.aiScore !== null);
  const avgMatchScore =
    scoredApplications.length > 0
      ? scoredApplications.reduce((sum, app) => sum + (app.aiScore ?? 0), 0) /
        scoredApplications.length
      : null;

  const jobStatusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<JobStatus, number>,
  );

  return {
    stats: {
      activeJobs: jobs.filter((job) => job.status === "OPEN").length,
      totalJobs: jobs.length,
      totalApplicants: applications.length,
      activeApplicants: applications.filter(
        (app) => !["REJECTED", "WITHDRAWN", "OFFERED"].includes(app.status),
      ).length,
      interviews: applications.filter((app) => app.status === "INTERVIEW")
        .length,
      shortlisted: applications.filter((app) => app.status === "SHORTLISTED")
        .length,
      avgMatchScore: avgMatchScore ? Math.round(avgMatchScore) : null,
      aiMatches: rankings.length,
    },
    statusCounts,
    jobStatusCounts,
    monthlyApplications: getMonthlyApplicationData(applications),
    recentApplications: applications.slice(0, 6),
    jobs: jobs.slice(0, 6),
    topCandidates: rankings.slice(0, 5),
    hrProfile,
  };
}

export async function getHRJobs(userId: string) {
  return prisma.job.findMany({
    where: { postedById: userId },
    include: {
      company: true,
      _count: { select: { applications: true, rankings: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getHRApplicants(userId: string) {
  return prisma.application.findMany({
    where: { job: { postedById: userId } },
    include: {
      job: { include: { company: true } },
      candidate: { include: { candidateProfile: true } },
      resume: true,
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function searchCandidates(userId: string, query?: string) {
  const applications = await prisma.application.findMany({
    where: { job: { postedById: userId } },
    select: { candidateId: true },
  });

  const candidateIds = [...new Set(applications.map((app) => app.candidateId))];

  const candidates = await prisma.user.findMany({
    where: {
      role: "CANDIDATE",
      ...(candidateIds.length > 0
        ? { id: { in: candidateIds } }
        : { candidateProfile: { isNot: null } }),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              {
                candidateProfile: {
                  skills: { hasSome: [query] },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      candidateProfile: true,
      applications: {
        where: { job: { postedById: userId } },
        include: { job: true },
      },
    },
    take: 50,
    orderBy: { name: "asc" },
  });

  return candidates;
}

export async function getHRAnalytics(userId: string) {
  const [applications, jobs, rankings] = await Promise.all([
    getHRApplicants(userId),
    getHRJobs(userId),
    prisma.candidateRanking.findMany({
      where: { job: { postedById: userId } },
      include: {
        job: true,
        candidate: { include: { candidateProfile: true } },
      },
      orderBy: { score: "desc" },
    }),
  ]);

  const funnel = {
    applied: applications.length,
    reviewing: applications.filter((a) => a.status === "REVIEWING").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
    offered: applications.filter((a) => a.status === "OFFERED").length,
  };

  const applicationsByJob = jobs.map((job) => ({
    jobTitle: job.title,
    count: job._count.applications,
  }));

  return {
    funnel,
    applicationsByJob,
    rankings: rankings.slice(0, 10),
    monthlyApplications: getMonthlyApplicationData(applications),
  };
}

export async function getHRSettings(userId: string) {
  const [hrProfile, settings] = await Promise.all([
    prisma.hRProfile.findUnique({
      where: { userId },
      include: { company: true, user: true },
    }),
    prisma.setting.findMany({
      where: { userId },
      orderBy: { category: "asc" },
    }),
  ]);

  return { hrProfile, settings };
}
