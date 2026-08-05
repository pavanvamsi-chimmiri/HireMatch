import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CandidateRankingView } from "@/types/candidate-match";

type CandidateMatchResultsProps = {
  rankings: CandidateRankingView[];
  jobId?: string;
};

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;

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

export function CandidateMatchResults({
  rankings,
  jobId,
}: CandidateMatchResultsProps) {
  if (rankings.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>AI Candidate Rankings</CardTitle>
          <CardDescription>
            Run AI matching to compare this job against all uploaded resumes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No rankings yet. Use semantic search and embeddings to rank
            candidates from highest to lowest match.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          AI Candidate Rankings
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Candidates ranked highest to lowest using embeddings and structured
          match scoring.
        </p>
      </div>

      <div className="space-y-4">
        {rankings.map((ranking) => (
          <Card
            key={ranking.id}
            className="border-border/50 overflow-hidden transition-all hover:border-blue-500/30 hover:shadow-md"
          >
            <div className="bg-gradient-to-r from-blue-600/10 via-cyan-600/5 to-transparent px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600/10 text-lg font-bold text-blue-700 dark:text-blue-300">
                    #{ranking.rank}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/dashboard/hr/candidates/${ranking.candidate.id}${jobId ? `?jobId=${jobId}` : ""}`}
                        className="hover:text-blue-600 hover:underline dark:hover:text-cyan-400"
                      >
                        {ranking.candidate.name ?? ranking.candidate.email}
                      </Link>
                    </CardTitle>
                    <CardDescription>{ranking.candidate.email}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs uppercase">
                    Overall Match
                  </p>
                  <p className="text-3xl font-bold text-blue-700 tabular-nums dark:text-cyan-300">
                    {Math.round(ranking.score)}%
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="grid gap-6 pt-6 lg:grid-cols-[320px_1fr]">
              <div className="space-y-3">
                <ScoreBar
                  label="ATS Match"
                  value={ranking.factors?.atsMatch ?? null}
                />
                <ScoreBar
                  label="Skill Match"
                  value={ranking.factors?.skillMatch ?? null}
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
                      {ranking.isShortlisted && (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <BadgeCheck className="mr-1 size-3" />
                          Shortlisted
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                <div className="rounded-xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="size-4 text-indigo-600 dark:text-indigo-300" />
                    AI Explanation
                  </div>
                  <p className="text-sm leading-7">
                    {ranking.aiSummary ?? "No explanation available."}
                  </p>
                </div>

                <Link
                  href={`/dashboard/hr/candidates/${ranking.candidate.id}${jobId ? `?jobId=${jobId}` : ""}`}
                  className="inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-cyan-400"
                >
                  View candidate profile →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
