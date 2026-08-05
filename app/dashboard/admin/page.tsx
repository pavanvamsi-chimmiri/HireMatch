import { requireRole } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/admin/queries";
import {
  AdminQuickActions,
  AdminRecentApplications,
  AdminRecentJobs,
  AdminRecentUsers,
  AdminStatCards,
} from "@/components/dashboard/admin/dashboard-widgets";
import { emptyAdminDashboardData } from "@/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  let data = emptyAdminDashboardData;
  try {
    data = await getAdminDashboardData();
  } catch {
    data = emptyAdminDashboardData;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Manage users, HR teams, candidates, jobs, applications, analytics,
          reports, and platform settings from one central control panel.
        </p>
      </div>

      <AdminStatCards stats={data.stats} />
      <AdminQuickActions />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminRecentUsers users={data.recentUsers} />
        <AdminRecentApplications applications={data.recentApplications} />
      </div>

      <AdminRecentJobs jobs={data.recentJobs} />
    </div>
  );
}
