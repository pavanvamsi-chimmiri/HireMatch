import { requireRole } from "@/lib/auth";
import { HRShell } from "@/components/dashboard/hr/hr-shell";

export default async function HRDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("HR");

  return <HRShell user={user}>{children}</HRShell>;
}
