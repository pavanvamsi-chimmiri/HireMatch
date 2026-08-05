import type { Prisma } from "@prisma/client";

// ─── User & Profile Types ─────────────────────────────────────────────────────

export type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    candidateProfile: true;
    hrProfile: { include: { company: true } };
  };
}>;

export type CandidateProfileWithUser = Prisma.CandidateProfileGetPayload<{
  include: { user: true };
}>;

export type HRProfileWithRelations = Prisma.HRProfileGetPayload<{
  include: { user: true; company: true };
}>;

// ─── Job Types ────────────────────────────────────────────────────────────────

export type JobWithRelations = Prisma.JobGetPayload<{
  include: {
    company: true;
    postedBy: true;
    applications: true;
    rankings: true;
  };
}>;

export type JobWithApplicationCount = Prisma.JobGetPayload<{
  include: {
    company: true;
    _count: { select: { applications: true; rankings: true } };
  };
}>;

// ─── Application Types ────────────────────────────────────────────────────────

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    job: { include: { company: true } };
    candidate: { include: { candidateProfile: true } };
    resume: true;
    analyses: true;
    ranking: true;
  };
}>;

// ─── Resume & Analysis Types ─────────────────────────────────────────────────

export type ResumeWithAnalyses = Prisma.ResumeGetPayload<{
  include: { analyses: true; candidate: true };
}>;

export type ResumeAnalysisWithRelations = Prisma.ResumeAnalysisGetPayload<{
  include: {
    resume: true;
    application: true;
    job: true;
  };
}>;

// ─── Ranking Types ────────────────────────────────────────────────────────────

export type CandidateRankingWithRelations = Prisma.CandidateRankingGetPayload<{
  include: {
    job: true;
    candidate: { include: { candidateProfile: true } };
    application: true;
  };
}>;

// ─── Notification & Email Types ───────────────────────────────────────────────

export type NotificationWithUser = Prisma.NotificationGetPayload<{
  include: { user: true };
}>;

export type EmailWithUser = Prisma.EmailGetPayload<{
  include: { user: true };
}>;

// ─── Settings Types ───────────────────────────────────────────────────────────

export type UserSetting = Prisma.SettingGetPayload<{
  include: { user: true };
}>;
