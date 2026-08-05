import type { ParsedResumeData } from "@/types/resume";

export function buildCandidateFullSearchText(input: {
  parsedText?: string | null;
  parsedData?: ParsedResumeData | null;
  profile?: {
    headline?: string | null;
    summary?: string | null;
    location?: string | null;
    skills?: string[];
  } | null;
}): string {
  const data = input.parsedData;

  return [
    input.profile?.headline ? `Headline: ${input.profile.headline}` : null,
    input.profile?.summary ? `Summary: ${input.profile.summary}` : null,
    input.profile?.location ? `Location: ${input.profile.location}` : null,
    data?.skills.length ? `Skills: ${data.skills.join(", ")}` : null,
    input.profile?.skills?.length
      ? `Profile Skills: ${input.profile.skills.join(", ")}`
      : null,
    data?.technologies.length
      ? `Technologies: ${data.technologies.join(", ")}`
      : null,
    data?.experience.length
      ? `Experience: ${data.experience.map((item) => `${item.title} at ${item.company} ${item.description ?? ""}`).join("; ")}`
      : null,
    data?.education.length
      ? `Education: ${data.education.map((item) => `${item.degree ?? ""} ${item.field ?? ""} ${item.institution}`).join("; ")}`
      : null,
    data?.projects.length
      ? `Projects: ${data.projects.map((item) => `${item.name} ${item.description ?? ""} ${item.technologies.join(", ")}`).join("; ")}`
      : null,
    data?.certifications.length
      ? `Certifications: ${data.certifications.join(", ")}`
      : null,
    input.parsedText ? `Resume: ${input.parsedText}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCandidateSkillsSearchText(
  parsedData?: ParsedResumeData | null,
  profileSkills: string[] = [],
): string {
  const skills = [
    ...new Set([...(parsedData?.skills ?? []), ...profileSkills]),
  ];
  const technologies = parsedData?.technologies ?? [];
  return `Skills and technologies: ${[...skills, ...technologies].join(", ")}`;
}

export function buildCandidateExperienceSearchText(
  parsedData?: ParsedResumeData | null,
  experienceYears?: number | null,
): string {
  const experience = (parsedData?.experience ?? [])
    .map(
      (item) =>
        `${item.title} at ${item.company}. ${item.description ?? ""} ${item.startDate ?? ""}-${item.endDate ?? "Present"}`,
    )
    .join("; ");

  return [
    experienceYears != null ? `${experienceYears} years of experience` : null,
    experience ? `Work history: ${experience}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCandidateEducationSearchText(
  parsedData?: ParsedResumeData | null,
): string {
  const education = (parsedData?.education ?? [])
    .map((item) =>
      `${item.degree ?? ""} ${item.field ?? ""} at ${item.institution}`.trim(),
    )
    .join("; ");

  return education ? `Education: ${education}` : "";
}

export function buildCandidateProjectsSearchText(
  parsedData?: ParsedResumeData | null,
): string {
  const projects = (parsedData?.projects ?? [])
    .map(
      (item) =>
        `${item.name}. ${item.description ?? ""}. Technologies: ${item.technologies.join(", ")}`,
    )
    .join("; ");

  return projects ? `Projects: ${projects}` : "";
}

export function buildCandidateProfileSearchText(
  profile?: {
    headline?: string | null;
    summary?: string | null;
    location?: string | null;
  } | null,
): string {
  return [
    profile?.headline ? `Headline: ${profile.headline}` : null,
    profile?.summary ? `Summary: ${profile.summary}` : null,
    profile?.location ? `Location: ${profile.location}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function extractLocationFromQuery(query: string): string | null {
  const match = query.match(
    /\b(?:in|near|around|based in|located in)\s+([a-zA-Z\s,]+)$/i,
  );
  if (match?.[1]) {
    return match[1].trim();
  }

  const cityState = query.match(
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*,\s*[A-Z]{2})\b/,
  );
  return cityState?.[1] ?? null;
}

export function calculateQueryLocationMatch(
  query: string,
  candidateLocation?: string | null,
  openToRemote?: boolean,
): number {
  const queryLocation = extractLocationFromQuery(query);
  const normalizedQuery = query.toLowerCase();

  if (normalizedQuery.includes("remote") && openToRemote !== false) {
    return 100;
  }

  if (!queryLocation || !candidateLocation) {
    if (normalizedQuery.includes("remote")) return openToRemote ? 90 : 50;
    return 55;
  }

  const target = queryLocation.toLowerCase();
  const candidate = candidateLocation.toLowerCase();

  if (candidate.includes(target) || target.includes(candidate)) {
    return 100;
  }

  const tokens = target
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length > 2);
  const matches = tokens.filter((token) => candidate.includes(token));
  return Math.round((matches.length / Math.max(tokens.length, 1)) * 100);
}

export function calculateHybridSearchScore(scores: {
  semanticScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  projectScore: number;
  locationScore: number;
  atsScore: number;
}): number {
  const weighted =
    scores.semanticScore * 0.4 +
    scores.skillScore * 0.15 +
    scores.experienceScore * 0.12 +
    scores.educationScore * 0.1 +
    scores.projectScore * 0.1 +
    scores.locationScore * 0.08 +
    scores.atsScore * 0.05;

  return Math.round(Math.max(0, Math.min(100, weighted)));
}

export function cosineToPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(100, ((value + 1) / 2) * 100)));
}
