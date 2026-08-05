export type {
  User,
  Company,
  Job,
  Application,
  UserRole,
  JobStatus,
  ApplicationStatus,
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

export * from "./database";
