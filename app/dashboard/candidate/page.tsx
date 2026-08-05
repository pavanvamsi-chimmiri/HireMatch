import { requireRole } from "@/lib/auth";
import { getCandidateDashboardData } from "@/lib/candidate/queries";
import {
  ApplicationStatusChart,
  ApplicationsTimelineChart,
} from "@/components/dashboard/candidate/charts";
import {
  RecentApplications,
  RecommendedJobsPreview,
  StatCards,
} from "@/components/dashboard/candidate/dashboard-widgets";

export const dynamic = "force-dynamic";

export default async function CandidateDashboardPage() {
  const user = await requireRole("CANDIDATE");

  let data;
  try {
    data = await getCandidateDashboardData(user.id);
  } catch {
    data = {
      stats: {
        totalApplications: 0,
        activeApplications: 0,
        avgMatchScore: null,
        interviews: 0,
        resumes: 0,
        unreadNotifications: 0,
      },
      statusCounts: {},
      monthlyApplications: [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
        { month: "Mar", count: 0 },
        { month: "Apr", count: 0 },
        { month: "May", count: 0 },
        { month: "Jun", count: 0 },
      ],
      recentApplications: [],
      recommendedJobs: [],
      notifications: [],
      resumes: [],
      candidateProfile: null,
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name?.split(" ")[0] ?? "Candidate"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your applications, discover new opportunities, and manage your
          job search.
        </p>
      </div>

      <StatCards stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationsTimelineChart data={data.monthlyApplications} />
        <ApplicationStatusChart statusCounts={data.statusCounts} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentApplications applications={data.recentApplications} />
        <RecommendedJobsPreview jobs={data.recommendedJobs} />
      </div>
    </div>
  );
}
