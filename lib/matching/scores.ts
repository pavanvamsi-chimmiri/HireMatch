import { keywordSimilarity } from "@/ai/embeddings";
import type { JobAnalysisResult } from "@/types/job-analysis";
import type { ParsedResumeData } from "@/types/resume";
import { jobAnalysisResultSchema } from "@/types/job-analysis";
import { parsedResumeDataSchema } from "@/types/resume";

export function buildJobMatchText(input: {
  title: string;
  description: string;
  qualifications?: string | null;
  responsibilities?: string | null;
  experienceRequired?: string | null;
  skillsRequired?: string[];
  parsedData?: unknown;
}): string {
  const parsed = jobAnalysisResultSchema.safeParse(input.parsedData);
  const analysis = parsed.success ? parsed.data : null;

  return [
    `Job Title: ${input.title}`,
    input.experienceRequired
      ? `Experience: ${input.experienceRequired}`
      : analysis?.experience?.summary
        ? `Experience: ${analysis.experience.summary}`
        : null,
    input.skillsRequired?.length
      ? `Skills: ${input.skillsRequired.join(", ")}`
      : null,
    analysis?.skills.length ? `Skills: ${analysis.skills.join(", ")}` : null,
    analysis?.technologies.length
      ? `Technologies: ${analysis.technologies.join(", ")}`
      : null,
    analysis?.keywords.length
      ? `Keywords: ${analysis.keywords.join(", ")}`
      : null,
    input.qualifications ? `Qualifications: ${input.qualifications}` : null,
    input.responsibilities
      ? `Responsibilities: ${input.responsibilities}`
      : null,
    analysis?.responsibilities.length
      ? `Responsibilities: ${analysis.responsibilities.join("; ")}`
      : null,
    `Description: ${input.description}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildResumeMatchText(input: {
  parsedText?: string | null;
  parsedData?: unknown;
}): string {
  const parsed = parsedResumeDataSchema.safeParse(input.parsedData);
  const data = parsed.success ? parsed.data : null;

  if (data) {
    return [
      data.name ? `Name: ${data.name}` : null,
      data.skills.length ? `Skills: ${data.skills.join(", ")}` : null,
      data.technologies.length
        ? `Technologies: ${data.technologies.join(", ")}`
        : null,
      data.certifications.length
        ? `Certifications: ${data.certifications.join(", ")}`
        : null,
      data.experience.length
        ? `Experience: ${data.experience.map((item) => `${item.title} at ${item.company}`).join("; ")}`
        : null,
      data.education.length
        ? `Education: ${data.education.map((item) => item.institution).join("; ")}`
        : null,
      data.projects.length
        ? `Projects: ${data.projects.map((item) => item.name).join("; ")}`
        : null,
      input.parsedText ? `Resume: ${input.parsedText}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return input.parsedText ?? "";
}

export function getJobRequirements(parsedData: unknown): JobAnalysisResult {
  const parsed = jobAnalysisResultSchema.safeParse(parsedData);
  if (parsed.success) return parsed.data;

  return {
    skills: [],
    technologies: [],
    education: [],
    experience: null,
    responsibilities: [],
    keywords: [],
  };
}

export function getResumeProfile(parsedData: unknown): ParsedResumeData | null {
  const parsed = parsedResumeDataSchema.safeParse(parsedData);
  return parsed.success ? parsed.data : null;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function listOverlapScore(required: string[], candidate: string[]): number {
  if (required.length === 0) {
    return candidate.length > 0 ? 65 : 50;
  }

  const candidateItems = candidate.map(normalize);
  const matches = required.filter((item) => {
    const target = normalize(item);
    return candidateItems.some(
      (candidateItem) =>
        candidateItem.includes(target) || target.includes(candidateItem),
    );
  });

  return Math.round((matches.length / required.length) * 100);
}

export function calculateSkillMatch(
  jobSkills: string[],
  jobTechnologies: string[],
  resume: ParsedResumeData | null,
): number {
  const required = [...jobSkills, ...jobTechnologies];
  const candidate = [
    ...(resume?.skills ?? []),
    ...(resume?.technologies ?? []),
  ];
  return listOverlapScore(required, candidate);
}

export function calculateExperienceMatch(
  jobExperienceRequired: string | null | undefined,
  jobAnalysis: JobAnalysisResult,
  resume: ParsedResumeData | null,
): number {
  const requiredYears = jobAnalysis.experience?.minimumYears ?? null;
  const candidateYears = resume?.experienceYears ?? null;

  if (requiredYears != null && candidateYears != null) {
    if (candidateYears >= requiredYears) return 100;
    return Math.max(
      20,
      Math.round((candidateYears / Math.max(requiredYears, 1)) * 100),
    );
  }

  const requiredText =
    `${jobExperienceRequired ?? ""} ${jobAnalysis.experience?.summary ?? ""}`.toLowerCase();
  const candidateText = (resume?.experience ?? [])
    .map((item) => `${item.title} ${item.company} ${item.description ?? ""}`)
    .join(" ")
    .toLowerCase();

  if (!requiredText.trim()) return candidateText ? 70 : 50;
  if (!candidateText) return 30;

  const tokens = requiredText
    .split(/[^a-z0-9+]+/i)
    .filter((token) => token.length > 3);
  const matches = tokens.filter((token) => candidateText.includes(token));
  return Math.round((matches.length / Math.max(tokens.length, 1)) * 100);
}

export function calculateEducationMatch(
  jobAnalysis: JobAnalysisResult,
  resume: ParsedResumeData | null,
): number {
  const required = jobAnalysis.education;
  const candidate = (resume?.education ?? []).flatMap((item) => [
    item.institution,
    item.degree ?? "",
    item.field ?? "",
  ]);

  return listOverlapScore(required, candidate);
}

export function calculateProjectMatch(
  jobSkills: string[],
  jobTechnologies: string[],
  resume: ParsedResumeData | null,
): number {
  const required = [...jobSkills, ...jobTechnologies];
  const projectTechnologies = (resume?.projects ?? []).flatMap(
    (project) => project.technologies,
  );
  const projectNames = (resume?.projects ?? []).map((project) => project.name);

  return listOverlapScore(required, [...projectTechnologies, ...projectNames]);
}

export function calculateCertificationMatch(
  jobAnalysis: JobAnalysisResult,
  resume: ParsedResumeData | null,
): number {
  const required = [
    ...jobAnalysis.skills,
    ...jobAnalysis.technologies,
    ...jobAnalysis.keywords,
  ];
  return listOverlapScore(required, resume?.certifications ?? []);
}

export function calculateAtsMatch(
  semanticSimilarity: number,
  jobKeywords: string[],
  resumeText: string,
): number {
  const semanticScore = Math.max(0, Math.min(100, semanticSimilarity * 100));
  const keywordScore = Math.round(
    keywordSimilarity(jobKeywords, resumeText) * 100,
  );
  return Math.round(semanticScore * 0.7 + keywordScore * 0.3);
}

export function calculateOverallMatch(factors: {
  atsMatch: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  projectMatch: number;
  certificationMatch: number;
}): number {
  const score =
    factors.atsMatch * 0.2 +
    factors.skillMatch * 0.2 +
    factors.experienceMatch * 0.15 +
    factors.educationMatch * 0.1 +
    factors.projectMatch * 0.15 +
    factors.certificationMatch * 0.2;

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function buildHeuristicExplanation(
  candidateName: string | null,
  factors: {
    overallMatch: number;
    atsMatch: number;
    skillMatch: number;
    experienceMatch: number;
  },
): string {
  const name = candidateName ?? "This candidate";
  return `${name} scores ${factors.overallMatch}% overall with strong alignment in skills (${factors.skillMatch}%), experience (${factors.experienceMatch}%), and ATS compatibility (${factors.atsMatch}%).`;
}
