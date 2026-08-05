import { requireRole } from "@/lib/auth";
import { getHRAnalytics } from "@/lib/hr/queries";
import {
  ApplicationsByJobChart,
  HiringActivityChart,
  HiringFunnelChart,
} from "@/components/dashboard/hr/charts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HRAnalyticsPage() {
  const user = await requireRole("HR");

  let data;
  try {
    data = await getHRAnalytics(user.id);
  } catch {
    data = {
      funnel: {
        applied: 0,
        reviewing: 0,
        shortlisted: 0,
        interview: 0,
        offered: 0,
      },
      applicationsByJob: [],
      rankings: [],
      monthlyApplications: [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
        { month: "Mar", count: 0 },
        { month: "Apr", count: 0 },
        { month: "May", count: 0 },
        { month: "Jun", count: 0 },
      ],
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track hiring funnel performance, applicant volume, and top AI-ranked
          candidates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Applied", value: data.funnel.applied },
          { label: "Reviewing", value: data.funnel.reviewing },
          { label: "Shortlisted", value: data.funnel.shortlisted },
          { label: "Interview", value: data.funnel.interview },
          { label: "Offered", value: data.funnel.offered },
        ].map((item) => (
          <Card key={item.label} className="border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-3xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HiringFunnelChart funnel={data.funnel} />
        <HiringActivityChart data={data.monthlyApplications} />
      </div>

      <ApplicationsByJobChart data={data.applicationsByJob} />

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Top AI-Ranked Candidates</CardTitle>
          <CardDescription>
            Highest scoring candidates across your open roles.{" "}
            <a
              href="/dashboard/hr/rankings"
              className="font-medium text-blue-600 hover:underline dark:text-cyan-400"
            >
              View all rankings
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {data.rankings.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No rankings available yet.
            </p>
          ) : (
            data.rankings.map((ranking) => (
              <div
                key={ranking.id}
                className="rounded-xl border bg-gradient-to-br from-blue-600/5 to-cyan-600/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {ranking.candidate.name ?? ranking.candidate.email}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {ranking.job.title}
                    </p>
                  </div>
                  <Badge className="bg-blue-600/10 text-blue-700 dark:text-blue-300">
                    {Math.round(ranking.score)}%
                  </Badge>
                </div>
                {ranking.aiSummary && (
                  <p className="text-muted-foreground mt-3 text-sm leading-6">
                    {ranking.aiSummary}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
