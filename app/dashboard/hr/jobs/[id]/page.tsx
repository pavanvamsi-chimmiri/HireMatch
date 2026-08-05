import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toJobAnalysisView } from "@/services/job-analyzer.service";
import { ExtractedJobData } from "@/components/dashboard/hr/extracted-job-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  OPEN: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const user = await requireRole("HR");
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id, postedById: user.id },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });

  if (!job) {
    notFound();
  }

  const analysis = toJobAnalysisView(job.parsedData, job.parsedAt);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/dashboard/hr/jobs">
              <ArrowLeft className="mr-2 size-4" />
              Back to jobs
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <Badge className={statusStyles[job.status] ?? statusStyles.DRAFT}>
                {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2">
              {job.company.name}
              {job.location || job.isRemote ? (
                <>
                  {" "}
                  ·{" "}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {job.isRemote ? "Remote" : job.location}
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>Original posting submitted by HR.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7">
            {job.experienceRequired && (
              <div>
                <p className="font-medium">Experience</p>
                <p className="text-muted-foreground">
                  {job.experienceRequired}
                </p>
              </div>
            )}
            {job.qualifications && (
              <div>
                <p className="font-medium">Qualifications</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.qualifications}
                </p>
              </div>
            )}
            {job.responsibilities && (
              <div>
                <p className="font-medium">Responsibilities</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.responsibilities}
                </p>
              </div>
            )}
            <div>
              <p className="font-medium">Complete Description</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 h-fit">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Applicants</span>
              <span className="font-medium">{job._count.applications}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Employment</span>
              <span className="font-medium">
                {job.employmentType.replace("_", " ")}
              </span>
            </div>
            {job.salaryMin && job.salaryMax && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-medium">
                  ${job.salaryMin.toLocaleString()} – $
                  {job.salaryMax.toLocaleString()}
                </span>
              </div>
            )}
            {job.skillsRequired.length > 0 && (
              <div className="pt-2">
                <p className="text-muted-foreground mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ExtractedJobData analysis={analysis} />
    </div>
  );
}
