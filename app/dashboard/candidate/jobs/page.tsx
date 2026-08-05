import Link from "next/link";
import { Briefcase } from "lucide-react";
import { requireRole } from "@/lib/auth";
import {
  getCandidateResumes,
  getRecommendedJobs,
} from "@/lib/candidate/queries";
import { JobRecommendationCard } from "@/components/dashboard/candidate/job-recommendation-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RecommendedJobsPage() {
  const user = await requireRole("CANDIDATE");

  let recommendations: Awaited<ReturnType<typeof getRecommendedJobs>> = [];
  let hasParsedResume = false;

  try {
    const [jobs, resumes] = await Promise.all([
      getRecommendedJobs(user.id),
      getCandidateResumes(user.id),
    ]);
    recommendations = jobs;
    hasParsedResume = resumes.some((resume) => resume.status === "PARSED");
  } catch {
    recommendations = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Recommended Jobs
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Jobs ranked by AI match using your skills, education, experience,
            projects, and location. Apply in one click.
          </p>
        </div>
        {!hasParsedResume && (
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/candidate/resume">Upload Resume</Link>
          </Button>
        )}
      </div>

      {recommendations.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="text-muted-foreground size-12 opacity-40" />
            <p className="text-muted-foreground mt-4 text-sm">
              No open jobs available right now. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recommendations.map((recommendation) => (
            <JobRecommendationCard
              key={recommendation.job.id}
              recommendation={recommendation}
              hasParsedResume={hasParsedResume}
            />
          ))}
        </div>
      )}
    </div>
  );
}
