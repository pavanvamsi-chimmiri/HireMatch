import { requireRole } from "@/lib/auth";
import { getCandidateDashboardData } from "@/lib/candidate/queries";
import { CandidateShell } from "@/components/dashboard/candidate/candidate-shell";

export default async function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("CANDIDATE");

  let unreadNotifications = 0;
  try {
    const data = await getCandidateDashboardData(user.id);
    unreadNotifications = data.stats.unreadNotifications;
  } catch {
    // Database may not be connected in all environments
  }

  return (
    <CandidateShell user={user} unreadNotifications={unreadNotifications}>
      {children}
    </CandidateShell>
  );
}
