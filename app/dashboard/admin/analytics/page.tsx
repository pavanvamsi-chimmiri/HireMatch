import { requireRole } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/admin/queries";
import {
  AdminAnalyticsSummaryCards,
  AdminApplicationStatusChart,
  AdminHiringOutcomeCards,
  AdminMonthlyTrendsChart,
  AdminRoleDistributionChart,
  AdminTopJobsChart,
} from "@/components/dashboard/admin/admin-analytics-charts";
import { emptyAdminAnalyticsData } from "@/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireRole("ADMIN");

  let data = emptyAdminAnalyticsData;
  try {
    data = await getAdminAnalytics();
  } catch {
    data = emptyAdminAnalyticsData;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Platform-wide metrics for users, hiring activity, application
          outcomes, and job performance.
        </p>
      </div>

      <AdminAnalyticsSummaryCards summary={data.summary} />
      <AdminHiringOutcomeCards summary={data.summary} />

      <AdminMonthlyTrendsChart data={data.monthlyTrends} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminRoleDistributionChart data={data.roleDistribution} />
        <AdminApplicationStatusChart data={data.applicationStatuses} />
      </div>

      <AdminTopJobsChart data={data.topJobs} />
    </div>
  );
}
