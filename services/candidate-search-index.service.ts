import {
  createEmbeddings,
  cosineSimilarity,
  EMBEDDING_MODEL,
} from "@/ai/embeddings";
import { serverEnv } from "@/lib/env";
import {
  buildCandidateEducationSearchText,
  buildCandidateExperienceSearchText,
  buildCandidateFullSearchText,
  buildCandidateProfileSearchText,
  buildCandidateProjectsSearchText,
  buildCandidateSkillsSearchText,
} from "@/lib/search/candidate-search-text";
import { prisma } from "@/lib/prisma";
import { parsedResumeDataSchema } from "@/types/resume";
import type { ResumeFacetEmbeddings } from "@/types/candidate-search";

function emptyFacetEmbeddings(): ResumeFacetEmbeddings {
  return {};
}

export async function indexCandidateResume(resumeId: string) {
  if (!serverEnv.OPENAI_API_KEY) {
    return null;
  }

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: {
      candidate: {
        include: { candidateProfile: true },
      },
    },
  });

  if (!resume || resume.status !== "PARSED") {
    return null;
  }

  const parsed = parsedResumeDataSchema.safeParse(resume.parsedData);
  const parsedData = parsed.success ? parsed.data : null;
  const profile = resume.candidate.candidateProfile;

  const texts = [
    buildCandidateFullSearchText({
      parsedText: resume.parsedText,
      parsedData,
      profile,
    }),
    buildCandidateSkillsSearchText(parsedData, profile?.skills ?? []),
    buildCandidateExperienceSearchText(parsedData, profile?.experienceYears),
    buildCandidateEducationSearchText(parsedData),
    buildCandidateProjectsSearchText(parsedData),
    buildCandidateProfileSearchText(profile),
  ].map((text) => text.slice(0, 8000));

  if (texts.every((text) => !text.trim())) {
    return null;
  }

  try {
    const embeddings = await createEmbeddings(texts);
    const facetEmbeddings: ResumeFacetEmbeddings = {
      full: embeddings[0],
      skills: embeddings[1],
      experience: embeddings[2],
      education: embeddings[3],
      projects: embeddings[4],
      profile: embeddings[5],
    };

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        embedding: facetEmbeddings.full ?? [],
        facetEmbeddings,
        embeddingModel: EMBEDDING_MODEL,
        embeddedAt: new Date(),
      },
    });

    return facetEmbeddings;
  } catch (error) {
    console.error(`Failed to index resume ${resumeId}:`, error);
    return null;
  }
}

export async function ensureResumeIndexed(resumeId: string) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: { embedding: true, facetEmbeddings: true, embeddedAt: true },
  });

  if (resume?.embedding && resume.facetEmbeddings) {
    return resume.facetEmbeddings as ResumeFacetEmbeddings;
  }

  return indexCandidateResume(resumeId);
}

export function getFacetSimilarity(
  queryEmbedding: number[],
  facetEmbeddings: ResumeFacetEmbeddings | null | undefined,
  facet: keyof ResumeFacetEmbeddings,
): number {
  const embedding = facetEmbeddings?.[facet];
  if (!embedding || embedding.length === 0) {
    return 0;
  }

  return cosineSimilarity(queryEmbedding, embedding);
}
