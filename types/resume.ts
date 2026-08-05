import { z } from "zod";

export const parsedEducationSchema = z.object({
  institution: z.string(),
  degree: z.string().nullable().optional(),
  field: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export const parsedExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const parsedProjectSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  technologies: z.array(z.string()).default([]),
  url: z.string().nullable().optional(),
});

export const parsedResumeDataSchema = z.object({
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  education: z.array(parsedEducationSchema).default([]),
  skills: z.array(z.string()).default([]),
  experience: z.array(parsedExperienceSchema).default([]),
  projects: z.array(parsedProjectSchema).default([]),
  certifications: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  experienceYears: z.number().nullable().optional(),
});

export type ParsedEducation = z.infer<typeof parsedEducationSchema>;
export type ParsedExperience = z.infer<typeof parsedExperienceSchema>;
export type ParsedProject = z.infer<typeof parsedProjectSchema>;
export type ParsedResumeData = z.infer<typeof parsedResumeDataSchema>;
