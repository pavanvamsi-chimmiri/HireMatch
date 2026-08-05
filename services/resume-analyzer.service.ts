import type { Prisma } from "@prisma/client";
import {
  analyzeResumeWithAI,
  analyzeResumeWithHeuristics,
} from "@/ai/analyze-resume";
import { parseResumeWithHeuristics } from "@/ai/parse-resume";
import { DEFAULT_MODEL } from "@/ai/client";
import { serverEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { parsedResumeDataSchema, type ParsedResumeData } from "@/types/resume";
import {
  recommendedProjectSchema,
  type ResumeAnalysisResult,
  type ResumeAnalysisView,
} from "@/types/resume-analysis";

export function toAnalysisView(
  analysis: Prisma.ResumeAnalysisGetPayload<object>,
): ResumeAnalysisView {
  const projects = Array.isArray(analysis.recommendedProjects)
    ? analysis.recommendedProjects
    : [];

  const parsedProjects = projects
    .map((project) => recommendedProjectSchema.safeParse(project))
    .filter((result) => result.success)
    .map((result) => result.data);

  return {
    id: analysis.id,
    status: analysis.status,
    atsScore: analysis.atsScore,
    resumeScore: analysis.overallScore,
    professionalSummary: analysis.summary,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    missingSkills: analysis.missingSkills,
    suggestedSkills: analysis.suggestedSkills,
    recommendedCertifications: analysis.recommendedCertifications,
    recommendedProjects: parsedProjects,
    skillsScore: analysis.skillsScore,
    experienceScore: analysis.experienceScore,
    educationScore: analysis.educationScore,
    keywordMatches: analysis.keywordMatches,
    analyzedAt: analysis.analyzedAt,
  };
}

async function persistAnalysis(
  analysisId: string,
  result: ResumeAnalysisResult,
  rawResponse: Prisma.InputJsonValue,
  tokensUsed?: number,
) {
  await prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: {
      status: "COMPLETED",
      atsScore: result.atsScore,
      overallScore: result.resumeScore,
      skillsScore: result.skillsScore ?? null,
      experienceScore: result.experienceScore ?? null,
      educationScore: result.educationScore ?? null,
      summary: result.professionalSummary,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      missingSkills: result.missingSkills,
      suggestedSkills: result.suggestedSkills,
      recommendedCertifications: result.recommendedCertifications,
      recommendedProjects: result.recommendedProjects as Prisma.InputJsonValue,
      gaps: result.missingSkills,
      keywordMatches: result.keywordMatches,
      model: serverEnv.OPENAI_API_KEY ? DEFAULT_MODEL : "heuristic",
      tokensUsed: tokensUsed ?? null,
      rawResponse,
      analyzedAt: new Date(),
    },
  });
}

export async function analyzeAndStoreResume(resumeId: string) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume?.parsedText) {
    throw new Error("Resume must be parsed before analysis.");
  }

  const parsedDataResult = parsedResumeDataSchema.safeParse(resume.parsedData);
  const parsedData = parsedDataResult.success
    ? parsedDataResult.data
    : parseResumeWithHeuristics(resume.parsedText);

  const existing = await prisma.resumeAnalysis.findFirst({
    where: {
      resumeId,
      jobId: null,
      applicationId: null,
    },
    orderBy: { createdAt: "desc" },
  });

  const analysis =
    existing ??
    (await prisma.resumeAnalysis.create({
      data: {
        resumeId,
        status: "PROCESSING",
      },
    }));

  if (existing) {
    await prisma.resumeAnalysis.update({
      where: { id: existing.id },
      data: { status: "PROCESSING" },
    });
  }

  try {
    let result: ResumeAnalysisResult;

    if (serverEnv.OPENAI_API_KEY) {
      try {
        result = await analyzeResumeWithAI(resume.parsedText, parsedData);
      } catch {
        result = analyzeResumeWithHeuristics(parsedData);
      }
    } else {
      result = analyzeResumeWithHeuristics(parsedData);
    }

    await persistAnalysis(analysis.id, result, result as Prisma.InputJsonValue);
    return result;
  } catch (error) {
    await prisma.resumeAnalysis.update({
      where: { id: analysis.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

export async function getLatestResumeAnalysis(
  resumeId: string,
): Promise<ResumeAnalysisView | null> {
  const analysis = await prisma.resumeAnalysis.findFirst({
    where: {
      resumeId,
      jobId: null,
      applicationId: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return analysis ? toAnalysisView(analysis) : null;
}

export function scheduleResumeAnalysis(resumeId: string) {
  void analyzeAndStoreResume(resumeId).catch((error) => {
    console.error(`Resume analysis failed for ${resumeId}:`, error);
  });
}
