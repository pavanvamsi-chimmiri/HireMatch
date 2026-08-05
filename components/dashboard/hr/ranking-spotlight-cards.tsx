import Link from "next/link";
import type { ReactNode } from "react";
import {
  Clock,
  Crown,
  FileCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HRRankingRow, HRRankingSpotlights } from "@/types/hr-rankings";

type RankingSpotlightCardsProps = {
  spotlights: HRRankingSpotlights;
};

type SpotlightCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  gradient: string;
  ranking: HRRankingRow | null;
  metricLabel: string;
  metricValue: string;
};

function SpotlightCard({
  title,
  subtitle,
  icon,
  gradient,
  ranking,
  metricLabel,
  metricValue,
}: SpotlightCardProps) {
  if (!ranking) {
    return (
      <Card className={`border-border/50 overflow-hidden ${gradient}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-white/70">
                {subtitle}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/60">No rankings yet</p>
        </CardContent>
      </Card>
    );
  }

  const candidateName = ranking.candidate.name ?? ranking.candidate.email;

  return (
    <Card
      className={`group border-border/50 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl ${gradient}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base text-white">{title}</CardTitle>
              <CardDescription className="text-white/70">
                {subtitle}
              </CardDescription>
            </div>
          </div>
          <Badge className="border-0 bg-white/15 text-white backdrop-blur">
            {metricLabel} {metricValue}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-lg font-semibold text-white">{candidateName}</p>
          <p className="text-sm text-white/70">{ranking.job.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-white/10 text-white">
            Overall {Math.round(ranking.score)}%
          </Badge>
          {ranking.factors && (
            <>
              <Badge className="border-0 bg-white/10 text-white/90">
                Skills {ranking.factors.skillMatch}%
              </Badge>
              <Badge className="border-0 bg-white/10 text-white/90">
                Exp {ranking.factors.experienceMatch}%
              </Badge>
            </>
          )}
        </div>
        <Link
          href={`/dashboard/hr/jobs/${ranking.job.id}`}
          className="inline-flex text-sm font-medium text-white/90 underline-offset-4 hover:text-white hover:underline"
        >
          View job match details
        </Link>
      </CardContent>
    </Card>
  );
}

export function RankingSpotlightCards({
  spotlights,
}: RankingSpotlightCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SpotlightCard
        title="Top Candidate"
        subtitle="Highest overall match"
        icon={<Trophy className="size-5 text-amber-200" />}
        gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white"
        ranking={spotlights.topCandidate}
        metricLabel="Match"
        metricValue={
          spotlights.topCandidate
            ? `${Math.round(spotlights.topCandidate.score)}%`
            : "—"
        }
      />
      <SpotlightCard
        title="Best Skill Match"
        subtitle="Strongest skill alignment"
        icon={<Target className="size-5 text-emerald-100" />}
        gradient="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white"
        ranking={spotlights.bestSkillMatch}
        metricLabel="Skills"
        metricValue={
          spotlights.bestSkillMatch?.factors
            ? `${spotlights.bestSkillMatch.factors.skillMatch}%`
            : "—"
        }
      />
      <SpotlightCard
        title="Highest ATS"
        subtitle="Best ATS compatibility"
        icon={<FileCheck className="size-5 text-blue-100" />}
        gradient="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white"
        ranking={spotlights.highestAts}
        metricLabel="ATS"
        metricValue={
          spotlights.highestAts?.factors
            ? `${spotlights.highestAts.factors.atsMatch}%`
            : "—"
        }
      />
      <SpotlightCard
        title="Newest Candidate"
        subtitle="Most recently applied"
        icon={<Clock className="size-5 text-fuchsia-100" />}
        gradient="bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white"
        ranking={spotlights.newestCandidate}
        metricLabel="Applied"
        metricValue={
          spotlights.newestCandidate?.application?.appliedAt
            ? new Date(
                spotlights.newestCandidate.application.appliedAt,
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : spotlights.newestCandidate
              ? new Date(
                  spotlights.newestCandidate.createdAt,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—"
        }
      />
    </div>
  );
}

export function RankingSummaryStrip({
  totalCount,
  filteredCount,
}: {
  totalCount: number;
  filteredCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-gradient-to-r from-blue-600/5 via-cyan-600/5 to-transparent px-5 py-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600/10">
        <Sparkles className="size-5 text-blue-600 dark:text-cyan-400" />
      </div>
      <div>
        <p className="font-medium">AI Candidate Rankings</p>
        <p className="text-muted-foreground text-sm">
          Showing {filteredCount} of {totalCount} ranked candidate
          {totalCount === 1 ? "" : "s"} across your jobs
        </p>
      </div>
      <Badge variant="secondary" className="ml-auto">
        <Crown className="mr-1 size-3" />
        Ranked by AI
      </Badge>
    </div>
  );
}
