import type { Prisma } from "@prisma/client";
import {
  analyzeJobWithAI,
  analyzeJobWithHeuristics,
  type JobAnalysisInput,
} from "@/ai/analyze-job";
import { DEFAULT_MODEL } from "@/ai/client";
import { serverEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  jobAnalysisResultSchema,
  type JobAnalysisResult,
  type JobAnalysisView,
} from "@/types/job-analysis";

function mergeUniqueStrings(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const list of lists) {
    for (const item of list) {
      const normalized = item.trim();
      if (!normalized) continue;
      const key = normalized.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(normalized);
    }
  }

  return merged;
}

function toAnalysisView(
  parsedData: unknown,
  parsedAt: Date | null,
): JobAnalysisView | null {
  const parsed = jobAnalysisResultSchema.safeParse(parsedData);
  if (!parsed.success) return null;

  return {
    ...parsed.data,
    parsedAt,
  };
}

export async function analyzeAndStoreJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Job not found.");
  }

  const input: JobAnalysisInput = {
    title: job.title,
    description: job.description,
    qualifications: job.qualifications,
    responsibilities: job.responsibilities,
    experienceRequired: job.experienceRequired,
    skillsRequired: job.skillsRequired,
    location: job.location,
    employmentType: job.employmentType,
  };

  let result: JobAnalysisResult;

  if (serverEnv.OPENAI_API_KEY) {
    try {
      result = await analyzeJobWithAI(input);
    } catch {
      result = analyzeJobWithHeuristics(input);
    }
  } else {
    result = analyzeJobWithHeuristics(input);
  }

  const mergedSkills = mergeUniqueStrings(
    job.skillsRequired,
    result.skills,
    result.technologies,
  );

  await prisma.job.update({
    where: { id: jobId },
    data: {
      parsedData: result as Prisma.InputJsonValue,
      parsedAt: new Date(),
      skillsRequired: mergedSkills,
    },
  });

  try {
    const jobRecord = await prisma.job.findUnique({
      where: { id: jobId },
      select: { postedById: true },
    });
    if (jobRecord) {
      const { matchCandidatesForJob } =
        await import("@/services/candidate-matching.service");
      await matchCandidatesForJob(jobId, jobRecord.postedById);
    }
  } catch (error) {
    console.error("Automatic candidate matching failed:", error);
  }

  return result;
}

export async function getJobAnalysis(
  jobId: string,
): Promise<JobAnalysisView | null> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { parsedData: true, parsedAt: true },
  });

  if (!job) return null;
  return toAnalysisView(job.parsedData, job.parsedAt);
}

export function toJobAnalysisView(
  parsedData: unknown,
  parsedAt: Date | null,
): JobAnalysisView | null {
  return toAnalysisView(parsedData, parsedAt);
}
