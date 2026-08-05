export type HRAnalyticsSummary = {
  applications: number;
  shortlisted: number;
  rejected: number;
  selected: number;
};

export type HRAnalyticsFunnel = {
  applied: number;
  reviewing: number;
  shortlisted: number;
  interview: number;
  selected: number;
  rejected: number;
};

export type HRAnalyticsMonthlyHiring = {
  month: string;
  applications: number;
  shortlisted: number;
  rejected: number;
  selected: number;
};

export type HRAnalyticsJobVolume = {
  jobTitle: string;
  count: number;
};

export type HRAnalyticsSkillVolume = {
  skill: string;
  count: number;
};

export type HRAnalyticsData = {
  summary: HRAnalyticsSummary;
  funnel: HRAnalyticsFunnel;
  monthlyHiring: HRAnalyticsMonthlyHiring[];
  mostAppliedJobs: HRAnalyticsJobVolume[];
  topSkills: HRAnalyticsSkillVolume[];
  rankings: Array<{
    id: string;
    score: number;
    aiSummary: string | null;
    candidate: {
      name: string | null;
      email: string;
    };
    job: {
      title: string;
    };
  }>;
};

export const emptyHRAnalyticsData: HRAnalyticsData = {
  summary: {
    applications: 0,
    shortlisted: 0,
    rejected: 0,
    selected: 0,
  },
  funnel: {
    applied: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  },
  monthlyHiring: [
    { month: "Jan", applications: 0, shortlisted: 0, rejected: 0, selected: 0 },
    { month: "Feb", applications: 0, shortlisted: 0, rejected: 0, selected: 0 },
    { month: "Mar", applications: 0, shortlisted: 0, rejected: 0, selected: 0 },
    { month: "Apr", applications: 0, shortlisted: 0, rejected: 0, selected: 0 },
    { month: "May", applications: 0, shortlisted: 0, rejected: 0, selected: 0 },
    { month: "Jun", applications: 0, shortlisted: 0, rejected: 0, selected: 0 },
  ],
  mostAppliedJobs: [],
  topSkills: [],
  rankings: [],
};
