import type { ApplicationStatus, JobStatus, UserRole } from "@prisma/client";

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers: number;
  hrUsers: number;
  candidates: number;
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  pendingApplications: number;
  companies: number;
  avgMatchScore: number | null;
};

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  profileCompleted: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  _count: {
    applications: number;
    jobs: number;
    resumes: number;
  };
};

export type AdminHRRow = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: Date;
  hrProfile: {
    jobTitle: string | null;
    department: string | null;
    company: {
      name: string;
    } | null;
  } | null;
  _count: {
    jobs: number;
  };
};

export type AdminCandidateRow = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: Date;
  candidateProfile: {
    headline: string | null;
    location: string | null;
    experienceYears: number | null;
    skills: string[];
  } | null;
  _count: {
    applications: number;
    resumes: number;
  };
};

export type AdminJobRow = {
  id: string;
  title: string;
  status: JobStatus;
  location: string | null;
  isRemote: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  company: {
    name: string;
  };
  postedBy: {
    name: string | null;
    email: string;
  };
  _count: {
    applications: number;
  };
};

export type AdminApplicationRow = {
  id: string;
  status: ApplicationStatus;
  aiScore: number | null;
  appliedAt: Date;
  candidate: {
    id: string;
    name: string | null;
    email: string;
  };
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
};

export type AdminAnalyticsSummary = {
  users: number;
  hrUsers: number;
  candidates: number;
  jobs: number;
  openJobs: number;
  applications: number;
  shortlisted: number;
  rejected: number;
  selected: number;
  companies: number;
};

export type AdminMonthlyTrend = {
  month: string;
  users: number;
  applications: number;
  jobs: number;
};

export type AdminRoleDistribution = {
  role: string;
  count: number;
};

export type AdminApplicationStatusBreakdown = {
  status: string;
  count: number;
};

export type AdminTopJob = {
  jobTitle: string;
  company: string;
  count: number;
};

export type AdminAnalyticsData = {
  summary: AdminAnalyticsSummary;
  monthlyTrends: AdminMonthlyTrend[];
  roleDistribution: AdminRoleDistribution[];
  applicationStatuses: AdminApplicationStatusBreakdown[];
  topJobs: AdminTopJob[];
};

export type AdminReportSection = {
  id: string;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string | number }>;
};

export type AdminReportsData = {
  generatedAt: string;
  sections: AdminReportSection[];
};

export type AdminSystemSetting = {
  id: string;
  category: string;
  key: string;
  value: unknown;
  updatedAt: Date;
};

export type AdminDashboardData = {
  stats: AdminDashboardStats;
  recentUsers: AdminUserRow[];
  recentApplications: AdminApplicationRow[];
  recentJobs: AdminJobRow[];
};

export const emptyAdminAnalyticsData: AdminAnalyticsData = {
  summary: {
    users: 0,
    hrUsers: 0,
    candidates: 0,
    jobs: 0,
    openJobs: 0,
    applications: 0,
    shortlisted: 0,
    rejected: 0,
    selected: 0,
    companies: 0,
  },
  monthlyTrends: [
    { month: "Jan", users: 0, applications: 0, jobs: 0 },
    { month: "Feb", users: 0, applications: 0, jobs: 0 },
    { month: "Mar", users: 0, applications: 0, jobs: 0 },
    { month: "Apr", users: 0, applications: 0, jobs: 0 },
    { month: "May", users: 0, applications: 0, jobs: 0 },
    { month: "Jun", users: 0, applications: 0, jobs: 0 },
  ],
  roleDistribution: [],
  applicationStatuses: [],
  topJobs: [],
};

export const emptyAdminDashboardData: AdminDashboardData = {
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    hrUsers: 0,
    candidates: 0,
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    companies: 0,
    avgMatchScore: null,
  },
  recentUsers: [],
  recentApplications: [],
  recentJobs: [],
};
