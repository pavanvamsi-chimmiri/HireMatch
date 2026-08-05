import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";
import {
  SearchScoreBadge,
  SearchScoreBar,
} from "@/components/dashboard/hr/global-search-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import type { CandidateSearchResponse } from "@/types/candidate-search";

type GlobalSearchResultsProps = {
  data: CandidateSearchResponse;
};

export function GlobalSearchResults({ data }: GlobalSearchResultsProps) {
  if (!data.query) {
    return (
      <Card className="border-border/50">
        <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-16 text-center text-sm">
          <Sparkles className="size-10 opacity-40" />
          <p>
            Enter a natural language query to search candidates with semantic
            vector embeddings.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data.results.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="text-muted-foreground flex items-center justify-center py-16 text-sm">
          No candidates matched your search query.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-gradient-to-r from-blue-600/5 via-cyan-600/5 to-transparent px-5 py-4">
        <div>
          <p className="font-medium">
            {data.results.length} candidate
            {data.results.length === 1 ? "" : "s"} matched
          </p>
          <p className="text-muted-foreground text-sm">
            Searched {data.totalCandidates} indexed resumes
            {data.usedEmbeddings ? " using vector embeddings" : ""}.
          </p>
        </div>
        <Badge variant="secondary">
          <Sparkles className="mr-1 size-3" />
          Semantic Search
        </Badge>
      </div>

      {data.results.map((result) => (
        <Card
          key={result.resumeId}
          className="border-border/50 overflow-hidden transition-all hover:border-blue-500/30 hover:shadow-lg"
        >
          <div className="bg-gradient-to-r from-blue-600/10 via-cyan-600/5 to-transparent px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  <Link
                    href={`/dashboard/hr/candidates/${result.candidateId}`}
                    className="hover:text-blue-600 hover:underline dark:hover:text-cyan-400"
                  >
                    {result.candidateName ?? result.candidateEmail}
                  </Link>
                </CardTitle>
                <CardDescription>{result.candidateEmail}</CardDescription>
                {result.headline && (
                  <p className="mt-2 text-sm font-medium">{result.headline}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.location && (
                    <Badge variant="outline">
                      <MapPin className="mr-1 size-3" />
                      {result.location}
                    </Badge>
                  )}
                  {result.hasAppliedToHrJobs && (
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      Pipeline candidate
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs uppercase">
                  Match Score
                </p>
                <p className="text-3xl font-bold text-blue-700 tabular-nums dark:text-cyan-300">
                  {result.scores.overallScore}%
                </p>
              </div>
            </div>
          </div>

          <CardContent className="grid gap-6 pt-6 lg:grid-cols-[320px_1fr]">
            <div className="space-y-3">
              <SearchScoreBar
                label="Semantic Search"
                value={result.scores.semanticScore}
                icon={Sparkles}
              />
              <SearchScoreBar
                label="Skills"
                value={result.scores.skillScore}
                icon={Target}
              />
              <SearchScoreBar
                label="Experience"
                value={result.scores.experienceScore}
                icon={Briefcase}
              />
              <SearchScoreBar
                label="Education"
                value={result.scores.educationScore}
                icon={GraduationCap}
              />
              <SearchScoreBar
                label="Projects"
                value={result.scores.projectScore}
                icon={Briefcase}
              />
              <SearchScoreBar
                label="Location"
                value={result.scores.locationScore}
                icon={MapPin}
              />
              <SearchScoreBar
                label="ATS Score"
                value={result.scores.atsScore}
                icon={Sparkles}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <SearchScoreBadge
                  label="Semantic"
                  value={result.scores.semanticScore}
                />
                <SearchScoreBadge
                  label="Skills"
                  value={result.scores.skillScore}
                />
                <SearchScoreBadge label="ATS" value={result.scores.atsScore} />
              </div>

              {result.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              {result.summary && (
                <div className="rounded-xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-4">
                  <p className="text-sm leading-7">{result.summary}</p>
                </div>
              )}

              <Link
                href={`/dashboard/hr/candidates/${result.candidateId}`}
                className="inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-cyan-400"
              >
                View candidate profile →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
