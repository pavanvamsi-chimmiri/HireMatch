import { requireRole } from "@/lib/auth";
import { getAdminReports } from "@/lib/admin/queries";
import { AdminReportsView } from "@/components/dashboard/admin/admin-reports-view";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireRole("ADMIN");

  let data: Awaited<ReturnType<typeof getAdminReports>>;
  try {
    data = await getAdminReports();
  } catch {
    data = {
      generatedAt: new Date().toISOString(),
      sections: [],
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Platform summary reports covering users, hiring pipeline, engagement,
          and top-performing jobs.
        </p>
      </div>

      <AdminReportsView data={data} />
    </div>
  );
}
