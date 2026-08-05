import {
  BarChart3,
  Briefcase,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";

export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "HR",
    href: "/dashboard/admin/hr",
    icon: UserCog,
  },
  {
    title: "Candidates",
    href: "/dashboard/admin/candidates",
    icon: UserCheck,
  },
  {
    title: "Jobs",
    href: "/dashboard/admin/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    href: "/dashboard/admin/applications",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    href: "/dashboard/admin/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
] as const;

export type AdminNavItem = (typeof adminNavItems)[number];
