import { z } from "zod";

export const resumeFacetEmbeddingsSchema = z.object({
  full: z.array(z.number()).optional(),
  skills: z.array(z.number()).optional(),
  experience: z.array(z.number()).optional(),
  education: z.array(z.number()).optional(),
  projects: z.array(z.number()).optional(),
  profile: z.array(z.number()).optional(),
});

export type ResumeFacetEmbeddings = z.infer<typeof resumeFacetEmbeddingsSchema>;

export const candidateSearchScoresSchema = z.object({
  overallScore: z.number(),
  semanticScore: z.number(),
  skillScore: z.number(),
  experienceScore: z.number(),
  educationScore: z.number(),
  projectScore: z.number(),
  locationScore: z.number(),
  atsScore: z.number(),
});

export type CandidateSearchScores = z.infer<typeof candidateSearchScoresSchema>;

export type CandidateSearchResult = {
  candidateId: string;
  resumeId: string;
  candidateName: string | null;
  candidateEmail: string;
  headline: string | null;
  location: string | null;
  skills: string[];
  scores: CandidateSearchScores;
  summary: string | null;
  hasAppliedToHrJobs: boolean;
  applicationCount: number;
};

export type CandidateSearchResponse = {
  query: string;
  results: CandidateSearchResult[];
  totalCandidates: number;
  usedEmbeddings: boolean;
};
