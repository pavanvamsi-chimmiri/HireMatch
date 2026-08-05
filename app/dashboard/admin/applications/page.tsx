import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { getAdminApplications } from "@/lib/admin/queries";
import { AdminSearchForm } from "@/components/dashboard/admin/admin-search-form";
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

type ApplicationsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  await requireRole("ADMIN");
  const { q } = await searchParams;

  let applications: Awaited<ReturnType<typeof getAdminApplications>> = [];
  try {
    applications = await getAdminApplications(q);
  } catch {
    applications = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-2">
            Monitor all candidate applications and AI scores platform-wide.
          </p>
        </div>
        <Suspense fallback={null}>
          <AdminSearchForm
            placeholder="Search by candidate, email, or job..."
            defaultValue={q ?? ""}
          />
        </Suspense>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            {applications.length} application
            {applications.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No applications found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
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
                    <TableCell>{application.job.title}</TableCell>
                    <TableCell>{application.job.company.name}</TableCell>
                    <TableCell>
                      {application.aiScore !== null
                        ? `${Math.round(application.aiScore)}%`
                        : "—"}
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
