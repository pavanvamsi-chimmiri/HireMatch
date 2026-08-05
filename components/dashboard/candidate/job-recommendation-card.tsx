import {
  Briefcase,
  Building2,
  DollarSign,
  GraduationCap,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";
import { ApplyJobButton } from "@/components/dashboard/candidate/apply-job-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CandidateJobRecommendation } from "@/types/candidate-job-match";

type JobRecommendationCardProps = {
  recommendation: CandidateJobRecommendation;
  compact?: boolean;
  hasParsedResume?: boolean;
};

function MatchBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

export function JobRecommendationCard({
  recommendation,
  compact = false,
  hasParsedResume = true,
}: JobRecommendationCardProps) {
  const { job, factors, matchPercentage, matchedSkills, summary } =
    recommendation;

  return (
    <Card className="border-border/50 overflow-hidden transition-all hover:border-violet-500/30 hover:shadow-md">
      <div className="bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
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
          <div className="text-right">
            <p className="text-muted-foreground text-xs uppercase">
              Match Score
            </p>
            <p className="text-3xl font-bold text-violet-700 tabular-nums dark:text-violet-300">
              {matchPercentage}%
            </p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-5 pt-5">
        {!compact && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {job.description}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MatchBar label="Skills" value={factors.skillMatch} />
          <MatchBar label="Experience" value={factors.experienceMatch} />
          <MatchBar label="Education" value={factors.educationMatch} />
          <MatchBar label="Projects" value={factors.projectMatch} />
          <MatchBar label="Location" value={factors.locationMatch} />
        </div>

        {matchedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                <Target className="mr-1 size-3" />
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {!compact && (
          <div className="rounded-xl border bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-violet-600 dark:text-violet-300" />
              Why this job matches you
            </div>
            <p className="text-sm leading-6">{summary}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              <Briefcase className="mr-1 size-3" />
              {job.employmentType.replace("_", " ")}
            </Badge>
            <Badge variant="outline">
              <GraduationCap className="mr-1 size-3" />
              Education {factors.educationMatch}%
            </Badge>
            <span className="text-muted-foreground text-xs">
              {job._count.applications} applicant
              {job._count.applications === 1 ? "" : "s"}
            </span>
          </div>

          <ApplyJobButton
            jobId={job.id}
            jobTitle={job.title}
            hasApplied={recommendation.hasApplied}
            applicationStatus={recommendation.applicationStatus}
            disabled={!hasParsedResume}
          />
        </div>

        {!hasParsedResume && (
          <p className="text-muted-foreground text-xs">
            Upload and parse your resume to enable one-click apply.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
