import {
  Bell,
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Upload,
  User,
} from "lucide-react";

export const candidateNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard/candidate",
    icon: LayoutDashboard,
  },
  {
    title: "Upload Resume",
    href: "/dashboard/candidate/resume",
    icon: Upload,
  },
  {
    title: "Recommended Jobs",
    href: "/dashboard/candidate/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    href: "/dashboard/candidate/applications",
    icon: ClipboardList,
  },
  {
    title: "Notifications",
    href: "/dashboard/candidate/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    href: "/dashboard/candidate/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/candidate/settings",
    icon: Settings,
  },
] as const;

export type CandidateNavItem = (typeof candidateNavItems)[number];
