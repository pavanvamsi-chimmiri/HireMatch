import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  Clock,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { HRRankingRow } from "@/types/hr-rankings";

type RankingListProps = {
  rankings: HRRankingRow[];
};

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

function formatAppliedDate(date: Date | null | undefined) {
  if (!date) return "Recently ranked";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RankingList({ rankings }: RankingListProps) {
  if (rankings.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Sparkles className="text-muted-foreground size-10" />
          <div>
            <p className="font-medium">No ranked candidates found</p>
            <p className="text-muted-foreground mt-1 max-w-md text-sm">
              Run AI matching on a job to compare resumes, or adjust your search
              and filters.
            </p>
          </div>
          <Link
            href="/dashboard/hr/jobs"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-cyan-400"
          >
            Go to Manage Jobs
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rankings.map((ranking) => {
        const candidateName = ranking.candidate.name ?? ranking.candidate.email;
        const appliedAt = ranking.application?.appliedAt ?? ranking.createdAt;

        return (
          <Card
            key={ranking.id}
            className="border-border/50 overflow-hidden transition-all hover:border-blue-500/30 hover:shadow-lg"
          >
            <div className="bg-gradient-to-r from-blue-600/10 via-cyan-600/5 to-transparent px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-lg font-bold text-white shadow-lg shadow-blue-500/20">
                    #{ranking.rank}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      <Link
                        href={`/dashboard/hr/candidates/${ranking.candidate.id}?jobId=${ranking.job.id}`}
                        className="hover:text-blue-600 hover:underline dark:hover:text-cyan-400"
                      >
                        {candidateName}
                      </Link>
                    </CardTitle>
                    <CardDescription>{ranking.candidate.email}</CardDescription>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        <Briefcase className="mr-1 size-3" />
                        {ranking.job.title}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="mr-1 size-3" />
                        {formatAppliedDate(appliedAt)}
                      </Badge>
                      {ranking.isShortlisted && (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <BadgeCheck className="mr-1 size-3" />
                          Shortlisted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid min-w-[220px] grid-cols-2 gap-3">
                  <div className="bg-background/80 rounded-2xl border p-4 text-center shadow-sm">
                    <p className="text-muted-foreground text-xs uppercase">
                      Overall Match
                    </p>
                    <p className="text-3xl font-bold text-blue-700 tabular-nums dark:text-cyan-300">
                      {Math.round(ranking.score)}%
                    </p>
                  </div>
                  <div className="bg-background/80 rounded-2xl border p-4 text-center shadow-sm">
                    <p className="text-muted-foreground text-xs uppercase">
                      Experience
                    </p>
                    <p className="text-3xl font-bold text-indigo-700 tabular-nums dark:text-indigo-300">
                      {ranking.factors?.experienceMatch ?? "—"}
                      {ranking.factors ? "%" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="grid gap-6 pt-6 lg:grid-cols-[320px_1fr]">
              <div className="space-y-3">
                <ScoreBar
                  label="Skill Match"
                  value={ranking.factors?.skillMatch ?? null}
                />
                <ScoreBar
                  label="ATS Match"
                  value={ranking.factors?.atsMatch ?? null}
                />
                <ScoreBar
                  label="Experience Match"
                  value={ranking.factors?.experienceMatch ?? null}
                />
                <ScoreBar
                  label="Education Match"
                  value={ranking.factors?.educationMatch ?? null}
                />
                <ScoreBar
                  label="Project Match"
                  value={ranking.factors?.projectMatch ?? null}
                />
                <ScoreBar
                  label="Certification Match"
                  value={ranking.factors?.certificationMatch ?? null}
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {ranking.factors && (
                    <>
                      <Badge className="bg-blue-600/10 text-blue-700 dark:text-blue-300">
                        <Target className="mr-1 size-3" />
                        Semantic {ranking.factors.semanticSimilarity}%
                      </Badge>
                      <Badge variant="secondary">
                        <Briefcase className="mr-1 size-3" />
                        Skills {ranking.factors.skillMatch}%
                      </Badge>
                      <Badge variant="secondary">
                        <GraduationCap className="mr-1 size-3" />
                        Education {ranking.factors.educationMatch}%
                      </Badge>
                    </>
                  )}
                  {ranking.candidate.candidateProfile?.skills
                    .slice(0, 4)
                    .map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                </div>

                {ranking.candidate.candidateProfile?.headline && (
                  <p className="text-muted-foreground text-sm">
                    {ranking.candidate.candidateProfile.headline}
                  </p>
                )}

                <div className="rounded-xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="size-4 text-indigo-600 dark:text-indigo-300" />
                    AI Explanation
                  </div>
                  <p className="text-sm leading-7">
                    {ranking.aiSummary ?? "No explanation available."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/dashboard/hr/candidates/${ranking.candidate.id}?jobId=${ranking.job.id}`}
                    className="inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-cyan-400"
                  >
                    View candidate profile →
                  </Link>
                  <Link
                    href={`/dashboard/hr/jobs/${ranking.job.id}`}
                    className="inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-cyan-400"
                  >
                    View full job match analysis →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
