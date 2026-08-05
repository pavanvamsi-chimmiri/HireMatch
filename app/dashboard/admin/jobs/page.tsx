import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { getAdminJobs } from "@/lib/admin/queries";
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

const jobStatusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  OPEN: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

type JobsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminJobsPage({ searchParams }: JobsPageProps) {
  await requireRole("ADMIN");
  const { q } = await searchParams;

  let jobs: Awaited<ReturnType<typeof getAdminJobs>> = [];
  try {
    jobs = await getAdminJobs(q);
  } catch {
    jobs = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-2">
            View and monitor all job postings across every company.
          </p>
        </div>
        <Suspense fallback={null}>
          <AdminSearchForm
            placeholder="Search jobs or companies..."
            defaultValue={q ?? ""}
          />
        </Suspense>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>
            {jobs.length} job posting{jobs.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No jobs found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Posted By</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <p className="font-medium">{job.title}</p>
                    </TableCell>
                    <TableCell>{job.company.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {job.postedBy.name ?? job.postedBy.email}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {job.postedBy.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.isRemote ? "Remote" : (job.location ?? "—")}
                    </TableCell>
                    <TableCell>{job._count.applications}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          jobStatusStyles[job.status] ?? jobStatusStyles.DRAFT
                        }
                      >
                        {job.status.charAt(0) +
                          job.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(job.createdAt).toLocaleDateString()}
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
