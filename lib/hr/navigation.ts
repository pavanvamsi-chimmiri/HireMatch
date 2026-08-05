import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  Mail,
  PlusCircle,
  Search,
  Settings,
  Trophy,
  Users,
} from "lucide-react";

export const hrNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard/hr",
    icon: LayoutDashboard,
  },
  {
    title: "Create Job",
    href: "/dashboard/hr/jobs/new",
    icon: PlusCircle,
  },
  {
    title: "Manage Jobs",
    href: "/dashboard/hr/jobs",
    icon: Briefcase,
  },
  {
    title: "Applicants",
    href: "/dashboard/hr/applicants",
    icon: Users,
  },
  {
    title: "Candidate Rankings",
    href: "/dashboard/hr/rankings",
    icon: Trophy,
  },
  {
    title: "Candidate Search",
    href: "/dashboard/hr/candidates",
    icon: Search,
  },
  {
    title: "Analytics",
    href: "/dashboard/hr/analytics",
    icon: BarChart3,
  },
  {
    title: "Email Candidates",
    href: "/dashboard/hr/email",
    icon: Mail,
  },
  {
    title: "Settings",
    href: "/dashboard/hr/settings",
    icon: Settings,
  },
] as const;

export type HRNavItem = (typeof hrNavItems)[number];
