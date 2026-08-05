import { requireRole } from "@/lib/auth";
import { getHRApplicants } from "@/lib/hr/queries";
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

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  REVIEWING: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  SHORTLISTED: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  INTERVIEW: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  OFFERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-300",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

export default async function ApplicantsPage() {
  const user = await requireRole("HR");

  let applicants: Awaited<ReturnType<typeof getHRApplicants>> = [];
  try {
    applicants = await getHRApplicants(user.id);
  } catch {
    applicants = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
        <p className="text-muted-foreground mt-2">
          Review candidates, AI scores, and application status across all roles.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Applicants</CardTitle>
          <CardDescription>
            {applicants.length} application
            {applicants.length === 1 ? "" : "s"} received
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applicants.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-center py-16 text-sm">
              No applicants yet. Post a job to start receiving applications.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {application.candidate.name ??
                            application.candidate.email}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {application.candidate.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.job.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {application.job.company.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {application.aiScore !== null ? (
                        <span className="font-medium tabular-nums">
                          {Math.round(application.aiScore)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusStyles[application.status] ??
                          statusStyles.PENDING
                        }
                      >
                        {application.status.charAt(0) +
                          application.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
