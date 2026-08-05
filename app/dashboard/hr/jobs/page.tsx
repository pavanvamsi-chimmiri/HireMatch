import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getHRJobs } from "@/lib/hr/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DRAFT: "bg-muted text-muted-foreground",
  OPEN: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default async function ManageJobsPage() {
  const user = await requireRole("HR");

  let jobs: Awaited<ReturnType<typeof getHRJobs>> = [];
  try {
    jobs = await getHRJobs(user.id);
  } catch {
    jobs = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground mt-2">
            View, publish, and track performance across all job postings.
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
        >
          <Link href="/dashboard/hr/jobs/new">Create Job</Link>
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>
            {jobs.length} job{jobs.length === 1 ? "" : "s"} in your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-16">
              <p className="text-sm">No jobs posted yet.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/hr/jobs/new">Create your first job</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/dashboard/hr/jobs/${job.id}`}
                          className="font-medium hover:underline"
                        >
                          {job.title}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {job.company.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusStyles[job.status] ?? statusStyles.DRAFT
                        }
                      >
                        {job.status.charAt(0) +
                          job.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="size-3.5" />
                        {job.isRemote ? "Remote" : (job.location ?? "—")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Users className="size-3.5" />
                        {job._count.applications}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(job.updatedAt).toLocaleDateString()}
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
