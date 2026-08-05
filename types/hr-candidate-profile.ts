import type { ApplicationStatus } from "@prisma/client";
import type { CandidateMatchFactors } from "@/types/candidate-match";
import type { ParsedResumeData } from "@/types/resume";
import type { ResumeAnalysisView } from "@/types/resume-analysis";

export type HRCandidateApplicationSummary = {
  id: string;
  status: ApplicationStatus;
  appliedAt: Date;
  aiScore: number | null;
  aiSummary: string | null;
  job: {
    id: string;
    title: string;
    company: { name: string };
  };
};

export type HRCandidateProfileView = {
  candidate: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    bio: string | null;
    avatarUrl: string | null;
    headline: string | null;
    summary: string | null;
    location: string | null;
    experienceYears: number | null;
    profileSkills: string[];
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
  };
  resume: {
    id: string;
    fileName: string;
    mimeType: string | null;
    status: string;
    uploadedAt: Date;
  } | null;
  parsedData: ParsedResumeData | null;
  analysis: ResumeAnalysisView | null;
  matchPercentage: number | null;
  aiSummary: string | null;
  ranking: {
    id: string;
    rank: number;
    score: number;
    isShortlisted: boolean;
    factors: CandidateMatchFactors | null;
    job: {
      id: string;
      title: string;
    };
  } | null;
  applications: HRCandidateApplicationSummary[];
  activeJobId: string | null;
};
