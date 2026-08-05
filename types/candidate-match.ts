import { z } from "zod";

export const candidateMatchFactorsSchema = z.object({
  overallMatch: z.number(),
  atsMatch: z.number(),
  skillMatch: z.number(),
  experienceMatch: z.number(),
  educationMatch: z.number(),
  projectMatch: z.number(),
  certificationMatch: z.number(),
  semanticSimilarity: z.number(),
});

export type CandidateMatchFactors = z.infer<typeof candidateMatchFactorsSchema>;

export type CandidateMatchResult = {
  candidateId: string;
  resumeId: string;
  candidateName: string | null;
  candidateEmail: string;
  rank: number;
  overallMatch: number;
  factors: CandidateMatchFactors;
  aiExplanation: string;
  applicationId: string | null;
};

export type CandidateRankingView = {
  id: string;
  rank: number;
  score: number;
  aiSummary: string | null;
  factors: CandidateMatchFactors | null;
  isShortlisted: boolean;
  candidate: {
    id: string;
    name: string | null;
    email: string;
  };
  applicationId: string | null;
};
