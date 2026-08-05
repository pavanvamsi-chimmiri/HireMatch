import { z } from "zod";

export const jobExperienceSchema = z.object({
  summary: z.string().nullable(),
  minimumYears: z.number().nullable().optional(),
  level: z.string().nullable().optional(),
});

export const jobAnalysisResultSchema = z.object({
  skills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  education: z.array(z.string()).default([]),
  experience: jobExperienceSchema.nullable().optional(),
  responsibilities: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type JobExperience = z.infer<typeof jobExperienceSchema>;
export type JobAnalysisResult = z.infer<typeof jobAnalysisResultSchema>;

export type JobAnalysisView = JobAnalysisResult & {
  parsedAt: Date | null;
};
