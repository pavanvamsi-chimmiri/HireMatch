import { MapPin, Briefcase, DollarSign, Building2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getRecommendedJobs } from "@/lib/candidate/queries";
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

export default async function RecommendedJobsPage() {
  const user = await requireRole("CANDIDATE");

  let jobs: Awaited<ReturnType<typeof getRecommendedJobs>> = [];
  try {
    jobs = await getRecommendedJobs(user.id);
  } catch {
    jobs = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recommended Jobs</h1>
        <p className="text-muted-foreground mt-2">
          Open positions sorted by skill match with your profile.
        </p>
      </div>

      {jobs.length === 0 ? (
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
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="border-border/50 transition-all hover:border-violet-500/30 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3.5" />
                        {job.company.name}
                      </span>
                      {(job.location || job.isRemote) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {job.isRemote ? "Remote" : job.location}
                        </span>
                      )}
                      {job.salaryMin && job.salaryMax && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="size-3.5" />$
                          {(job.salaryMin / 1000).toFixed(0)}k – $
                          {(job.salaryMax / 1000).toFixed(0)}k
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {job.employmentType.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {job.description}
                </p>
                {job.skillsRequired.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skillsRequired.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skillsRequired.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skillsRequired.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    {job._count.applications} applicant
                    {job._count.applications !== 1 ? "s" : ""}
                  </span>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    disabled
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
