import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCandidateDashboardData(userId: string) {
  const [
    applications,
    resumes,
    notifications,
    unreadNotifications,
    openJobs,
    candidateProfile,
  ] = await Promise.all([
    prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: { include: { company: true } },
      },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.resume.findMany({
      where: { candidateId: userId },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
    prisma.job.findMany({
      where: { status: "OPEN" },
      include: { company: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
    prisma.candidateProfile.findUnique({
      where: { userId },
    }),
  ]);

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ApplicationStatus, number>,
  );

  const avgScore =
    applications.length > 0
      ? applications.reduce((sum, app) => sum + (app.aiScore ?? 0), 0) /
          applications.filter((a) => a.aiScore !== null).length || 0
      : null;

  const monthlyApplications = getMonthlyApplicationData(applications);

  return {
    stats: {
      totalApplications: applications.length,
      activeApplications: applications.filter(
        (a) => !["REJECTED", "WITHDRAWN", "OFFERED"].includes(a.status),
      ).length,
      savedJobs: 0,
      avgMatchScore: avgScore ? Math.round(avgScore) : null,
      interviews: applications.filter((a) => a.status === "INTERVIEW").length,
      resumes: resumes.length,
      unreadNotifications,
    },
    statusCounts,
    monthlyApplications,
    recentApplications: applications.slice(0, 5),
    recommendedJobs: openJobs,
    notifications,
    resumes,
    candidateProfile,
  };
}

function getMonthlyApplicationData(
  applications: { appliedAt: Date }[],
): { month: string; count: number }[] {
  const months: Record<string, number> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString("en-US", {
      month: "short",
    });
    months[key] = 0;
  }

  applications.forEach((app) => {
    const key = app.appliedAt.toLocaleDateString("en-US", {
      month: "short",
    });
    if (key in months) {
      months[key]++;
    }
  });

  return Object.entries(months).map(([month, count]) => ({ month, count }));
}

export async function getCandidateApplications(userId: string) {
  return prisma.application.findMany({
    where: { candidateId: userId },
    include: {
      job: { include: { company: true } },
      resume: true,
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function getCandidateNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCandidateResumes(userId: string) {
  return prisma.resume.findMany({
    where: { candidateId: userId },
    include: {
      analyses: {
        where: {
          jobId: null,
          applicationId: null,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function getRecommendedJobs(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
  });

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  if (!profile?.skills.length) {
    return jobs;
  }

  return [...jobs].sort((a, b) => {
    const scoreA = a.skillsRequired.filter((s) =>
      profile.skills.some((ps) => ps.toLowerCase() === s.toLowerCase()),
    ).length;
    const scoreB = b.skillsRequired.filter((s) =>
      profile.skills.some((ps) => ps.toLowerCase() === s.toLowerCase()),
    ).length;
    return scoreB - scoreA;
  });
}

export async function getCandidateSettings(userId: string) {
  return prisma.setting.findMany({
    where: { userId },
    orderBy: { category: "asc" },
  });
}
