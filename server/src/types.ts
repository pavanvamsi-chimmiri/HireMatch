export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  minYearsExperience: number;
  skills: string[];
  description: string;
}

export interface Candidate {
  id: number;
  name: string;
  title: string;
  location: string;
  remote: boolean;
  yearsExperience: number;
  skills: string[];
  summary: string;
}

export interface MatchBreakdown {
  skillScore: number;
  experienceScore: number;
  locationScore: number;
}

export interface CandidateMatch {
  candidate: Candidate;
  score: number;
  breakdown: MatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface JobMatch {
  job: Job;
  score: number;
  breakdown: MatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
}
