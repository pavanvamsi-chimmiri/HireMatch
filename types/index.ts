export type {
  User,
  CandidateProfile,
  HRProfile,
  Company,
  Job,
  Application,
  Resume,
  ResumeAnalysis,
  Notification,
  Email,
  CandidateRanking,
  Setting,
  UserRole,
  JobStatus,
  EmploymentType,
  ApplicationStatus,
  ResumeStatus,
  AnalysisStatus,
  NotificationType,
  EmailStatus,
  EmailType,
  SettingScope,
} from "@prisma/client";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

export type Feature = {
  icon: string;
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export * from "./resume";
export * from "./resume-analysis";
export * from "./job-analysis";
export * from "./candidate-match";

export * from "./database";
