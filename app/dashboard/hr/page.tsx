import { requireRole } from "@/lib/auth";
import { getHRDashboardData } from "@/lib/hr/queries";
import {
  ApplicantPipelineChart,
  HiringActivityChart,
} from "@/components/dashboard/hr/charts";
import {
  ActiveJobsPreview,
  HRQuickActions,
  HRStatCards,
  RecentApplicants,
} from "@/components/dashboard/hr/dashboard-widgets";

export const dynamic = "force-dynamic";

export default async function HRDashboardPage() {
  const user = await requireRole("HR");

  let data;
  try {
    data = await getHRDashboardData(user.id);
  } catch {
    data = {
      stats: {
        activeJobs: 0,
        totalApplicants: 0,
        activeApplicants: 0,
        interviews: 0,
        shortlisted: 0,
        avgMatchScore: null,
      },
      statusCounts: {},
      jobStatusCounts: {},
      monthlyApplications: [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
        { month: "Mar", count: 0 },
        { month: "Apr", count: 0 },
        { month: "May", count: 0 },
        { month: "Jun", count: 0 },
      ],
      recentApplications: [],
      jobs: [],
      topCandidates: [],
      hrProfile: null,
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name?.split(" ")[0] ?? "HR Manager"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage job postings, review AI-matched candidates, and track your
          hiring pipeline.
        </p>
      </div>

      <HRStatCards stats={data.stats} />

      <HRQuickActions companyName={data.hrProfile?.company?.name} />

      <div className="grid gap-6 lg:grid-cols-2">
        <HiringActivityChart data={data.monthlyApplications} />
        <ApplicantPipelineChart statusCounts={data.statusCounts} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentApplicants applications={data.recentApplications} />
        <ActiveJobsPreview jobs={data.jobs} />
      </div>
    </div>
  );
}
