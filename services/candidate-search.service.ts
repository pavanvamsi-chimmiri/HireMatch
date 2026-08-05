import { createEmbedding, cosineSimilarity } from "@/ai/embeddings";
import { serverEnv } from "@/lib/env";
import {
  buildCandidateFullSearchText,
  calculateHybridSearchScore,
  calculateQueryLocationMatch,
  cosineToPercent,
} from "@/lib/search/candidate-search-text";
import { prisma } from "@/lib/prisma";
import {
  ensureResumeIndexed,
  getFacetSimilarity,
  indexCandidateResume,
} from "@/services/candidate-search-index.service";
import {
  candidateSearchScoresSchema,
  resumeFacetEmbeddingsSchema,
  type CandidateSearchResponse,
  type CandidateSearchResult,
} from "@/types/candidate-search";
import { parsedResumeDataSchema } from "@/types/resume";

function buildSearchSummary(
  candidateName: string | null,
  scores: CandidateSearchResult["scores"],
): string {
  const name = candidateName ?? "This candidate";
  return `${name} matched your search with ${scores.overallScore}% overall relevance, ${scores.semanticScore}% semantic similarity, ${scores.skillScore}% skill alignment, and ${scores.atsScore}% ATS compatibility.`;
}

async function scoreCandidateResume(
  hrUserId: string,
  query: string,
  queryEmbedding: number[] | null,
  resume: {
    id: string;
    parsedText: string | null;
    parsedData: unknown;
    embedding: unknown;
    facetEmbeddings: unknown;
    candidate: {
      id: string;
      name: string | null;
      email: string;
      candidateProfile: {
        headline: string | null;
        summary: string | null;
        location: string | null;
        skills: string[];
        openToRemote: boolean;
      } | null;
      applications: { job: { postedById: string } }[];
    };
    analyses: { atsScore: number | null }[];
  },
): Promise<CandidateSearchResult | null> {
  let facetEmbeddings = resumeFacetEmbeddingsSchema.safeParse(
    resume.facetEmbeddings,
  ).success
    ? resumeFacetEmbeddingsSchema.parse(resume.facetEmbeddings)
    : null;

  if (!facetEmbeddings && serverEnv.OPENAI_API_KEY) {
    facetEmbeddings = (await ensureResumeIndexed(resume.id)) ?? null;
  }

  const parsed = parsedResumeDataSchema.safeParse(resume.parsedData);
  const parsedData = parsed.success ? parsed.data : null;

  let semanticSimilarity = 0;
  if (queryEmbedding) {
    if (facetEmbeddings?.full?.length) {
      semanticSimilarity = cosineSimilarity(
        queryEmbedding,
        facetEmbeddings.full,
      );
    } else if (Array.isArray(resume.embedding) && resume.embedding.length > 0) {
      semanticSimilarity = cosineSimilarity(
        queryEmbedding,
        resume.embedding as number[],
      );
    } else {
      const fallbackText = buildCandidateFullSearchText({
        parsedText: resume.parsedText,
        parsedData,
        profile: resume.candidate.candidateProfile,
      });

      if (serverEnv.OPENAI_API_KEY && fallbackText.trim()) {
        try {
          const resumeEmbedding = await createEmbedding(fallbackText);
          semanticSimilarity = cosineSimilarity(
            queryEmbedding,
            resumeEmbedding,
          );
          await indexCandidateResume(resume.id);
        } catch {
          semanticSimilarity = 0;
        }
      }
    }
  }

  const semanticScore = cosineToPercent(semanticSimilarity);
  const skillScore = queryEmbedding
    ? cosineToPercent(
        getFacetSimilarity(queryEmbedding, facetEmbeddings, "skills"),
      )
    : 0;
  const experienceScore = queryEmbedding
    ? cosineToPercent(
        getFacetSimilarity(queryEmbedding, facetEmbeddings, "experience"),
      )
    : 0;
  const educationScore = queryEmbedding
    ? cosineToPercent(
        getFacetSimilarity(queryEmbedding, facetEmbeddings, "education"),
      )
    : 0;
  const projectScore = queryEmbedding
    ? cosineToPercent(
        getFacetSimilarity(queryEmbedding, facetEmbeddings, "projects"),
      )
    : 0;
  const locationScore = calculateQueryLocationMatch(
    query,
    resume.candidate.candidateProfile?.location,
    resume.candidate.candidateProfile?.openToRemote,
  );
  const atsScore = Math.round(resume.analyses[0]?.atsScore ?? 0);

  const scores = candidateSearchScoresSchema.parse({
    semanticScore,
    skillScore,
    experienceScore,
    educationScore,
    projectScore,
    locationScore,
    atsScore,
    overallScore: calculateHybridSearchScore({
      semanticScore,
      skillScore,
      experienceScore,
      educationScore,
      projectScore,
      locationScore,
      atsScore,
    }),
  });

  const hrApplications = resume.candidate.applications.filter(
    (application) => application.job.postedById === hrUserId,
  );

  return {
    candidateId: resume.candidate.id,
    resumeId: resume.id,
    candidateName: resume.candidate.name,
    candidateEmail: resume.candidate.email,
    headline: resume.candidate.candidateProfile?.headline ?? null,
    location: resume.candidate.candidateProfile?.location ?? null,
    skills: [
      ...new Set([
        ...(resume.candidate.candidateProfile?.skills ?? []),
        ...(parsedData?.skills ?? []),
      ]),
    ].slice(0, 8),
    scores,
    summary: buildSearchSummary(resume.candidate.name, scores),
    hasAppliedToHrJobs: hrApplications.length > 0,
    applicationCount: hrApplications.length,
  };
}

export async function searchCandidatesGlobally(
  hrUserId: string,
  query: string,
): Promise<CandidateSearchResponse> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      query: trimmedQuery,
      results: [],
      totalCandidates: 0,
      usedEmbeddings: false,
    };
  }

  const resumes = await prisma.resume.findMany({
    where: {
      status: "PARSED",
      parsedText: { not: null },
    },
    include: {
      candidate: {
        include: {
          candidateProfile: true,
          applications: {
            include: {
              job: {
                select: { postedById: true },
              },
            },
          },
        },
      },
      analyses: {
        where: { status: "COMPLETED" },
        orderBy: { analyzedAt: "desc" },
        take: 1,
        select: { atsScore: true },
      },
    },
    orderBy: { parsedAt: "desc" },
  });

  let queryEmbedding: number[] | null = null;
  let usedEmbeddings = false;

  if (serverEnv.OPENAI_API_KEY) {
    try {
      queryEmbedding = await createEmbedding(trimmedQuery);
      usedEmbeddings = queryEmbedding.length > 0;
    } catch {
      queryEmbedding = null;
    }
  }

  const scoredResults: CandidateSearchResult[] = [];

  for (const resume of resumes) {
    const result = await scoreCandidateResume(
      hrUserId,
      trimmedQuery,
      queryEmbedding,
      resume,
    );

    if (result && result.scores.overallScore > 0) {
      scoredResults.push(result);
    }
  }

  scoredResults.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

  return {
    query: trimmedQuery,
    results: scoredResults,
    totalCandidates: resumes.length,
    usedEmbeddings,
  };
}
