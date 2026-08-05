import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getHRAnalytics } from "@/lib/hr/queries";
import {
  AnalyticsHiringFunnelChart,
  AnalyticsSummaryCards,
  ApplicationPipelineChart,
  ApplicationsMetricsChart,
  MonthlyHiringChart,
  MonthlySelectionTrendChart,
  MostAppliedJobsChart,
  TopRankedCandidatesPanel,
  TopSkillsChart,
} from "@/components/dashboard/hr/analytics-charts";
import { Button } from "@/components/ui/button";
import { emptyHRAnalyticsData } from "@/types/hr-analytics";

export const dynamic = "force-dynamic";

export default async function HRAnalyticsPage() {
  const user = await requireRole("HR");

  let data = emptyHRAnalyticsData;
  try {
    data = await getHRAnalytics(user.id);
  } catch {
    data = emptyHRAnalyticsData;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Track applications, shortlisted and rejected candidates, hiring
            outcomes, monthly trends, top skills, and funnel performance with
            responsive charts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/hr/applicants">View Applicants</Link>
          </Button>
          <Button
            asChild
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
          >
            <Link href="/dashboard/hr/rankings">Candidate Rankings</Link>
          </Button>
        </div>
      </div>

      <AnalyticsSummaryCards summary={data.summary} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ApplicationsMetricsChart summary={data.summary} />
        <ApplicationPipelineChart summary={data.summary} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MonthlyHiringChart data={data.monthlyHiring} />
        <MonthlySelectionTrendChart data={data.monthlyHiring} />
      </div>

      <AnalyticsHiringFunnelChart funnel={data.funnel} />

      <div className="grid gap-6 xl:grid-cols-2">
        <MostAppliedJobsChart data={data.mostAppliedJobs} />
        <TopSkillsChart data={data.topSkills} />
      </div>

      <TopRankedCandidatesPanel rankings={data.rankings} />
    </div>
  );
}
