import { requireRole } from "@/lib/auth";
import { getCandidateApplications } from "@/lib/candidate/queries";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  REVIEWING: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  SHORTLISTED: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  INTERVIEW: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  OFFERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-300",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

export default async function ApplicationsPage() {
  const user = await requireRole("CANDIDATE");

  let applications: Awaited<ReturnType<typeof getCandidateApplications>> = [];
  try {
    applications = await getCandidateApplications(user.id);
  } catch {
    applications = [];
  }

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground mt-2">
          Track the status of all your job applications.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW"] as const).map(
          (status) => (
            <Card key={status} className="border-border/50">
              <CardHeader className="pb-2">
                <CardDescription>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </CardDescription>
                <CardTitle className="text-3xl">
                  {statusCounts[status] ?? 0}
                </CardTitle>
              </CardHeader>
            </Card>
          ),
        )}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            {applications.length} total application
            {applications.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <p className="text-sm">No applications submitted yet.</p>
            </div>
          ) : (
            <div className="border-border/50 overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.job.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {app.job.company.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {app.aiScore !== null ? (
                          <div className="flex items-center gap-2">
                            <Progress
                              value={app.aiScore}
                              className="h-2 w-16"
                            />
                            <span className="text-sm tabular-nums">
                              {Math.round(app.aiScore)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusStyles[app.status] ?? statusStyles.PENDING
                          }
                        >
                          {app.status.charAt(0) +
                            app.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
