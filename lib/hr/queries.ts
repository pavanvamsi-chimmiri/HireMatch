import type { ApplicationStatus, JobStatus } from "@prisma/client";
import { canHRAccessCandidate } from "@/lib/hr/candidate-access";
import { prisma } from "@/lib/prisma";
import { toAnalysisView } from "@/services/resume-analyzer.service";
import { candidateMatchFactorsSchema } from "@/types/candidate-match";
import type { HRCandidateProfileView } from "@/types/hr-candidate-profile";
import type {
  HRRankingFilters,
  HRRankingRow,
  HRRankingSpotlights,
  HRRankingsData,
  RankingSortOption,
} from "@/types/hr-rankings";
import { parsedResumeDataSchema } from "@/types/resume";

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

function sortRankings(
  rankings: HRRankingRow[],
  sort: RankingSortOption,
): HRRankingRow[] {
  const sorted = [...rankings];

  switch (sort) {
    case "rank":
      return sorted.sort((a, b) => a.rank - b.rank);
    case "skill":
      return sorted.sort(
        (a, b) => (b.factors?.skillMatch ?? 0) - (a.factors?.skillMatch ?? 0),
      );
    case "ats":
      return sorted.sort(
        (a, b) => (b.factors?.atsMatch ?? 0) - (a.factors?.atsMatch ?? 0),
      );
    case "experience":
      return sorted.sort(
        (a, b) =>
          (b.factors?.experienceMatch ?? 0) - (a.factors?.experienceMatch ?? 0),
      );
    case "newest":
      return sorted.sort((a, b) => {
        const aDate = a.application?.appliedAt ?? a.createdAt;
        const bDate = b.application?.appliedAt ?? b.createdAt;
        return bDate.getTime() - aDate.getTime();
      });
    case "overall":
    default:
      return sorted.sort((a, b) => b.score - a.score);
  }
}

function computeSpotlights(rankings: HRRankingRow[]): HRRankingSpotlights {
  if (rankings.length === 0) {
    return {
      topCandidate: null,
      bestSkillMatch: null,
      highestAts: null,
      newestCandidate: null,
    };
  }

  return {
    topCandidate: [...rankings].sort((a, b) => b.score - a.score)[0] ?? null,
    bestSkillMatch:
      [...rankings].sort(
        (a, b) => (b.factors?.skillMatch ?? 0) - (a.factors?.skillMatch ?? 0),
      )[0] ?? null,
    highestAts:
      [...rankings].sort(
        (a, b) => (b.factors?.atsMatch ?? 0) - (a.factors?.atsMatch ?? 0),
      )[0] ?? null,
    newestCandidate:
      [...rankings].sort((a, b) => {
        const aDate = a.application?.appliedAt ?? a.createdAt;
        const bDate = b.application?.appliedAt ?? b.createdAt;
        return bDate.getTime() - aDate.getTime();
      })[0] ?? null,
  };
}

function mapRankingRow(
  ranking: Awaited<
    ReturnType<
      typeof prisma.candidateRanking.findMany<{
        include: {
          job: { include: { company: true } };
          candidate: { include: { candidateProfile: true } };
          application: { select: { appliedAt: true } };
        };
      }>
    >
  >[number],
): HRRankingRow {
  const parsedFactors = candidateMatchFactorsSchema.safeParse(ranking.factors);

  return {
    id: ranking.id,
    rank: ranking.rank,
    score: ranking.score,
    aiSummary: ranking.aiSummary,
    factors: parsedFactors.success ? parsedFactors.data : null,
    isShortlisted: ranking.isShortlisted,
    createdAt: ranking.createdAt,
    candidate: ranking.candidate,
    job: ranking.job,
    application: ranking.application,
  };
}

export async function getHRRankings(
  userId: string,
  filters: HRRankingFilters = {},
): Promise<HRRankingsData> {
  const [rankings, jobs] = await Promise.all([
    prisma.candidateRanking.findMany({
      where: { job: { postedById: userId } },
      include: {
        job: { include: { company: true } },
        candidate: { include: { candidateProfile: true } },
        application: { select: { appliedAt: true } },
      },
    }),
    prisma.job.findMany({
      where: { postedById: userId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const rows = rankings.map(mapRankingRow);
  const spotlights = computeSpotlights(rows);

  let filtered = rows;

  if (filters.jobId) {
    filtered = filtered.filter((row) => row.job.id === filters.jobId);
  }

  if (filters.shortlisted) {
    filtered = filtered.filter((row) => row.isShortlisted);
  }

  if (filters.minScore != null && filters.minScore > 0) {
    filtered = filtered.filter((row) => row.score >= filters.minScore!);
  }

  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(
      (row) =>
        row.candidate.name?.toLowerCase().includes(query) ||
        row.candidate.email.toLowerCase().includes(query) ||
        row.job.title.toLowerCase().includes(query) ||
        row.job.company.name.toLowerCase().includes(query),
    );
  }

  const sorted = sortRankings(filtered, filters.sort ?? "overall");

  return {
    rankings: sorted,
    jobs,
    spotlights,
    totalCount: rows.length,
    filteredCount: sorted.length,
  };
}

export async function getHRCandidateProfile(
  hrUserId: string,
  candidateId: string,
  jobId?: string,
): Promise<HRCandidateProfileView | null> {
  const hasAccess = await canHRAccessCandidate(hrUserId, candidateId);
  if (!hasAccess) return null;

  const candidate = await prisma.user.findUnique({
    where: { id: candidateId },
    include: {
      candidateProfile: true,
      resumes: {
        orderBy: [{ isPrimary: "desc" }, { uploadedAt: "desc" }],
      },
      applications: {
        where: { job: { postedById: hrUserId } },
        include: {
          job: { include: { company: true } },
          resume: true,
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!candidate) return null;

  const activeApplication = jobId
    ? candidate.applications.find((application) => application.jobId === jobId)
    : candidate.applications[0];

  const activeJobId = jobId ?? activeApplication?.jobId ?? null;

  const ranking = activeJobId
    ? await prisma.candidateRanking.findUnique({
        where: {
          jobId_candidateId: {
            jobId: activeJobId,
            candidateId,
          },
        },
        include: { job: true },
      })
    : await prisma.candidateRanking.findFirst({
        where: {
          candidateId,
          job: { postedById: hrUserId },
        },
        orderBy: { score: "desc" },
        include: { job: true },
      });

  const resume =
    activeApplication?.resume ??
    candidate.resumes.find((item) => item.isPrimary) ??
    candidate.resumes[0] ??
    null;

  const parsedDataResult = parsedResumeDataSchema.safeParse(resume?.parsedData);
  const parsedData = parsedDataResult.success ? parsedDataResult.data : null;

  let analysisRecord = null;
  if (resume) {
    analysisRecord = activeJobId
      ? await prisma.resumeAnalysis.findFirst({
          where: {
            resumeId: resume.id,
            jobId: activeJobId,
            status: "COMPLETED",
          },
          orderBy: { analyzedAt: "desc" },
        })
      : await prisma.resumeAnalysis.findFirst({
          where: {
            resumeId: resume.id,
            status: "COMPLETED",
          },
          orderBy: { analyzedAt: "desc" },
        });
  }

  const parsedFactors = candidateMatchFactorsSchema.safeParse(ranking?.factors);
  const profile = candidate.candidateProfile;

  return {
    candidate: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      bio: candidate.bio,
      avatarUrl: candidate.avatarUrl,
      headline: profile?.headline ?? null,
      summary: profile?.summary ?? null,
      location: profile?.location ?? null,
      experienceYears:
        profile?.experienceYears ?? parsedData?.experienceYears ?? null,
      profileSkills: profile?.skills ?? [],
      linkedinUrl: profile?.linkedinUrl ?? null,
      githubUrl: profile?.githubUrl ?? null,
      portfolioUrl: profile?.portfolioUrl ?? null,
    },
    resume: resume
      ? {
          id: resume.id,
          fileName: resume.fileName,
          mimeType: resume.mimeType,
          status: resume.status,
          uploadedAt: resume.uploadedAt,
        }
      : null,
    parsedData,
    analysis: analysisRecord ? toAnalysisView(analysisRecord) : null,
    matchPercentage: ranking?.score ?? activeApplication?.aiScore ?? null,
    aiSummary:
      ranking?.aiSummary ??
      activeApplication?.aiSummary ??
      analysisRecord?.summary ??
      null,
    ranking: ranking
      ? {
          id: ranking.id,
          rank: ranking.rank,
          score: ranking.score,
          isShortlisted: ranking.isShortlisted,
          factors: parsedFactors.success ? parsedFactors.data : null,
          job: {
            id: ranking.job.id,
            title: ranking.job.title,
          },
        }
      : null,
    applications: candidate.applications.map((application) => ({
      id: application.id,
      status: application.status,
      appliedAt: application.appliedAt,
      aiScore: application.aiScore,
      aiSummary: application.aiSummary,
      job: {
        id: application.job.id,
        title: application.job.title,
        company: { name: application.job.company.name },
      },
    })),
    activeJobId,
  };
}
