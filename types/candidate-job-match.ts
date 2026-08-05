import { z } from "zod";

export const candidateJobMatchFactorsSchema = z.object({
  overallMatch: z.number(),
  skillMatch: z.number(),
  experienceMatch: z.number(),
  educationMatch: z.number(),
  projectMatch: z.number(),
  locationMatch: z.number(),
});

export type CandidateJobMatchFactors = z.infer<
  typeof candidateJobMatchFactorsSchema
>;

export type CandidateJobRecommendation = {
  job: {
    id: string;
    title: string;
    description: string;
    location: string | null;
    isRemote: boolean;
    employmentType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    skillsRequired: string[];
    company: {
      name: string;
    };
    _count: {
      applications: number;
    };
  };
  matchPercentage: number;
  factors: CandidateJobMatchFactors;
  summary: string;
  matchedSkills: string[];
  hasApplied: boolean;
  applicationId: string | null;
  applicationStatus: string | null;
};
