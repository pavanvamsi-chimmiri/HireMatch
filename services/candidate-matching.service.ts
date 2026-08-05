import type { Prisma } from "@prisma/client";
import {
  createEmbedding,
  createEmbeddings,
  cosineSimilarity,
  keywordSimilarity,
} from "@/ai/embeddings";
import {
  buildFallbackExplanation,
  generateMatchExplanation,
} from "@/ai/match-explanation";
import { serverEnv } from "@/lib/env";
import {
  buildHeuristicExplanation,
  buildJobMatchText,
  buildResumeMatchText,
  calculateAtsMatch,
  calculateCertificationMatch,
  calculateEducationMatch,
  calculateExperienceMatch,
  calculateOverallMatch,
  calculateProjectMatch,
  calculateSkillMatch,
  getJobRequirements,
  getResumeProfile,
} from "@/lib/matching/scores";
import { prisma } from "@/lib/prisma";
import {
  candidateMatchFactorsSchema,
  type CandidateMatchFactors,
  type CandidateMatchResult,
  type CandidateRankingView,
} from "@/types/candidate-match";

function getMatchedSkills(
  jobSkills: string[],
  jobTechnologies: string[],
  resumeSkills: string[],
  resumeTechnologies: string[],
): string[] {
  const required = [...jobSkills, ...jobTechnologies];
  const candidate = [...resumeSkills, ...resumeTechnologies];
  const normalizedCandidate = candidate.map((item) => item.toLowerCase());

  return required
    .filter((item, index) => {
      const target = item.toLowerCase();
      return normalizedCandidate.some(
        (candidateItem) =>
          candidateItem.includes(target) || target.includes(candidateItem),
      );
    })
    .filter((item, index, array) => array.indexOf(item) === index);
}

async function scoreResumeAgainstJob(
  job: {
    id: string;
    title: string;
    description: string;
    qualifications: string | null;
    responsibilities: string | null;
    experienceRequired: string | null;
    skillsRequired: string[];
    parsedData: unknown;
  },
  resume: {
    id: string;
    candidateId: string;
    parsedText: string | null;
    parsedData: unknown;
    candidate: {
      name: string | null;
      email: string;
    };
  },
  jobEmbedding: number[] | null,
  resumeEmbedding: number[] | null,
): Promise<CandidateMatchResult> {
  const jobAnalysis = getJobRequirements(job.parsedData);
  const resumeProfile = getResumeProfile(resume.parsedData);
  const jobText = buildJobMatchText({
    title: job.title,
    description: job.description,
    qualifications: job.qualifications,
    responsibilities: job.responsibilities,
    experienceRequired: job.experienceRequired,
    skillsRequired: job.skillsRequired,
    parsedData: job.parsedData,
  });
  const resumeText = buildResumeMatchText({
    parsedText: resume.parsedText,
    parsedData: resume.parsedData,
  });

  const semanticSimilarity =
    jobEmbedding && resumeEmbedding
      ? cosineSimilarity(jobEmbedding, resumeEmbedding)
      : keywordSimilarity(
          [
            ...job.skillsRequired,
            ...jobAnalysis.skills,
            ...jobAnalysis.keywords,
          ],
          resumeText,
        );

  const skillMatch = calculateSkillMatch(
    [...job.skillsRequired, ...jobAnalysis.skills],
    jobAnalysis.technologies,
    resumeProfile,
  );
  const experienceMatch = calculateExperienceMatch(
    job.experienceRequired,
    jobAnalysis,
    resumeProfile,
  );
  const educationMatch = calculateEducationMatch(jobAnalysis, resumeProfile);
  const projectMatch = calculateProjectMatch(
    [...job.skillsRequired, ...jobAnalysis.skills],
    jobAnalysis.technologies,
    resumeProfile,
  );
  const certificationMatch = calculateCertificationMatch(
    jobAnalysis,
    resumeProfile,
  );
  const atsMatch = calculateAtsMatch(
    semanticSimilarity,
    [...jobAnalysis.keywords, ...job.skillsRequired, ...jobAnalysis.skills],
    resumeText,
  );

  const factors: CandidateMatchFactors = {
    overallMatch: 0,
    atsMatch,
    skillMatch,
    experienceMatch,
    educationMatch,
    projectMatch,
    certificationMatch,
    semanticSimilarity: Math.round(semanticSimilarity * 100),
  };

  factors.overallMatch = calculateOverallMatch(factors);

  const matchedSkills = getMatchedSkills(
    [...job.skillsRequired, ...jobAnalysis.skills],
    jobAnalysis.technologies,
    resumeProfile?.skills ?? [],
    resumeProfile?.technologies ?? [],
  );

  const gaps = [...job.skillsRequired, ...jobAnalysis.technologies].filter(
    (item) => !matchedSkills.includes(item),
  );

  let aiExplanation = buildHeuristicExplanation(resume.candidate.name, factors);

  if (serverEnv.OPENAI_API_KEY) {
    try {
      aiExplanation = await generateMatchExplanation({
        jobTitle: job.title,
        candidateName: resume.candidate.name,
        factors,
        matchedSkills,
        gaps: gaps.slice(0, 5),
      });
    } catch {
      aiExplanation = buildFallbackExplanation({
        candidateName: resume.candidate.name,
        factors,
        matchedSkills,
      });
    }
  }

  const application = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId: job.id,
        candidateId: resume.candidateId,
      },
    },
    select: { id: true },
  });

  return {
    candidateId: resume.candidateId,
    resumeId: resume.id,
    candidateName: resume.candidate.name,
    candidateEmail: resume.candidate.email,
    rank: 0,
    overallMatch: factors.overallMatch,
    factors,
    aiExplanation,
    applicationId: application?.id ?? null,
  };
}

export async function matchCandidatesForJob(jobId: string, postedById: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, postedById },
  });

  if (!job) {
    throw new Error("Job not found.");
  }

  const resumes = await prisma.resume.findMany({
    where: {
      status: "PARSED",
      parsedText: { not: null },
    },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const jobText = buildJobMatchText({
    title: job.title,
    description: job.description,
    qualifications: job.qualifications,
    responsibilities: job.responsibilities,
    experienceRequired: job.experienceRequired,
    skillsRequired: job.skillsRequired,
    parsedData: job.parsedData,
  });

  let jobEmbedding: number[] | null = null;
  let resumeEmbeddings: number[][] = [];

  if (serverEnv.OPENAI_API_KEY && resumes.length > 0) {
    try {
      const resumeTexts = resumes.map((resume) =>
        buildResumeMatchText({
          parsedText: resume.parsedText,
          parsedData: resume.parsedData,
        }),
      );
      const embeddings = await createEmbeddings([jobText, ...resumeTexts]);
      jobEmbedding = embeddings[0] ?? null;
      resumeEmbeddings = embeddings.slice(1);
    } catch {
      try {
        jobEmbedding = await createEmbedding(jobText);
      } catch {
        jobEmbedding = null;
      }
    }
  }

  const results: CandidateMatchResult[] = [];

  for (const [index, resume] of resumes.entries()) {
    let resumeEmbedding: number[] | null = resumeEmbeddings[index] ?? null;

    if (
      serverEnv.OPENAI_API_KEY &&
      !resumeEmbedding &&
      jobEmbedding &&
      resumes.length > 0
    ) {
      try {
        resumeEmbedding = await createEmbedding(
          buildResumeMatchText({
            parsedText: resume.parsedText,
            parsedData: resume.parsedData,
          }),
        );
      } catch {
        resumeEmbedding = null;
      }
    }

    const result = await scoreResumeAgainstJob(
      job,
      resume,
      jobEmbedding,
      resumeEmbedding,
    );
    results.push(result);
  }

  results.sort((a, b) => b.overallMatch - a.overallMatch);
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  await prisma.$transaction(async (tx) => {
    await tx.candidateRanking.deleteMany({ where: { jobId } });

    for (const result of results) {
      await tx.candidateRanking.create({
        data: {
          jobId,
          candidateId: result.candidateId,
          applicationId: result.applicationId,
          rank: result.rank,
          score: result.overallMatch,
          aiSummary: result.aiExplanation,
          factors: result.factors as Prisma.InputJsonValue,
        },
      });

      if (result.applicationId) {
        await tx.application.update({
          where: { id: result.applicationId },
          data: {
            aiScore: result.overallMatch,
            aiSummary: result.aiExplanation,
          },
        });
      }
    }
  });

  return results;
}

export function toRankingView(
  ranking: Prisma.CandidateRankingGetPayload<{
    include: { candidate: { select: { id: true; name: true; email: true } } };
  }>,
): CandidateRankingView {
  const parsedFactors = candidateMatchFactorsSchema.safeParse(ranking.factors);

  return {
    id: ranking.id,
    rank: ranking.rank,
    score: ranking.score,
    aiSummary: ranking.aiSummary,
    factors: parsedFactors.success ? parsedFactors.data : null,
    isShortlisted: ranking.isShortlisted,
    candidate: ranking.candidate,
    applicationId: ranking.applicationId,
  };
}

export async function getJobCandidateRankings(
  jobId: string,
  postedById: string,
): Promise<CandidateRankingView[]> {
  const rankings = await prisma.candidateRanking.findMany({
    where: {
      jobId,
      job: { postedById },
    },
    include: {
      candidate: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { rank: "asc" },
  });

  return rankings.map(toRankingView);
}
