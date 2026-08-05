import type { CandidateMatchFactors } from "@/types/candidate-match";

export type RankingSortOption =
  "overall" | "rank" | "skill" | "ats" | "experience" | "newest";

export type HRRankingRow = {
  id: string;
  rank: number;
  score: number;
  aiSummary: string | null;
  factors: CandidateMatchFactors | null;
  isShortlisted: boolean;
  createdAt: Date;
  candidate: {
    id: string;
    name: string | null;
    email: string;
    candidateProfile: {
      headline: string | null;
      skills: string[];
    } | null;
  };
  job: {
    id: string;
    title: string;
    company: { name: string };
  };
  application: {
    appliedAt: Date;
  } | null;
};

export type HRRankingSpotlights = {
  topCandidate: HRRankingRow | null;
  bestSkillMatch: HRRankingRow | null;
  highestAts: HRRankingRow | null;
  newestCandidate: HRRankingRow | null;
};

export type HRRankingFilters = {
  q?: string;
  jobId?: string;
  shortlisted?: boolean;
  minScore?: number;
  sort?: RankingSortOption;
};

export type HRRankingsData = {
  rankings: HRRankingRow[];
  jobs: { id: string; title: string }[];
  spotlights: HRRankingSpotlights;
  totalCount: number;
  filteredCount: number;
};
