import type { Candidate, Job, MatchBreakdown } from "./types.js";

const SKILL_WEIGHT = 0.6;
const EXPERIENCE_WEIGHT = 0.25;
const LOCATION_WEIGHT = 0.15;

const normalize = (skill: string): string => skill.trim().toLowerCase();

export interface ScoreResult {
  score: number;
  breakdown: MatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
}

/**
 * Score how well a candidate fits a job on a 0-100 scale.
 * The score blends skill overlap, experience adequacy and location/remote fit.
 */
export function scoreMatch(candidate: Candidate, job: Job): ScoreResult {
  const candidateSkills = new Set(candidate.skills.map(normalize));

  const matchedSkills = job.skills.filter((skill) => candidateSkills.has(normalize(skill)));
  const missingSkills = job.skills.filter((skill) => !candidateSkills.has(normalize(skill)));

  const skillScore = job.skills.length === 0 ? 1 : matchedSkills.length / job.skills.length;

  // Meeting the required experience yields a full score; being under is
  // penalised proportionally, being over gives a small bonus (capped at 1).
  const experienceScore =
    job.minYearsExperience <= 0
      ? 1
      : Math.min(1, candidate.yearsExperience / job.minYearsExperience);

  const locationScore = job.remote || candidate.remote
    ? 1
    : normalize(candidate.location) === normalize(job.location)
      ? 1
      : 0.2;

  const composite =
    skillScore * SKILL_WEIGHT +
    experienceScore * EXPERIENCE_WEIGHT +
    locationScore * LOCATION_WEIGHT;

  return {
    score: Math.round(composite * 100),
    breakdown: {
      skillScore: Math.round(skillScore * 100),
      experienceScore: Math.round(experienceScore * 100),
      locationScore: Math.round(locationScore * 100),
    },
    matchedSkills,
    missingSkills,
  };
}
