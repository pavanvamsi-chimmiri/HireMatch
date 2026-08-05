import { z } from "zod";

export const recommendedProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).default([]),
  rationale: z.string().nullable().optional(),
});

export const resumeAnalysisResultSchema = z.object({
  atsScore: z.number().min(0).max(100),
  resumeScore: z.number().min(0).max(100),
  professionalSummary: z.string(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  suggestedSkills: z.array(z.string()).default([]),
  recommendedCertifications: z.array(z.string()).default([]),
  recommendedProjects: z.array(recommendedProjectSchema).default([]),
  skillsScore: z.number().min(0).max(100).nullable().optional(),
  experienceScore: z.number().min(0).max(100).nullable().optional(),
  educationScore: z.number().min(0).max(100).nullable().optional(),
  keywordMatches: z.array(z.string()).default([]),
});

export type RecommendedProject = z.infer<typeof recommendedProjectSchema>;
export type ResumeAnalysisResult = z.infer<typeof resumeAnalysisResultSchema>;

export type ResumeAnalysisView = {
  id: string;
  status: string;
  atsScore: number | null;
  resumeScore: number | null;
  professionalSummary: string | null;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestedSkills: string[];
  recommendedCertifications: string[];
  recommendedProjects: RecommendedProject[];
  skillsScore: number | null;
  experienceScore: number | null;
  educationScore: number | null;
  keywordMatches: string[];
  analyzedAt: Date | null;
};
