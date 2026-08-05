import { Suspense } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getHRRankings } from "@/lib/hr/queries";
import {
  RankingSpotlightCards,
  RankingSummaryStrip,
} from "@/components/dashboard/hr/ranking-spotlight-cards";
import { RankingList } from "@/components/dashboard/hr/ranking-list";
import { RankingToolbar } from "@/components/dashboard/hr/ranking-toolbar";
import { Button } from "@/components/ui/button";
import type { RankingSortOption } from "@/types/hr-rankings";

export const dynamic = "force-dynamic";

type CandidateRankingsPageProps = {
  searchParams: Promise<{
    q?: string;
    jobId?: string;
    sort?: string;
    minScore?: string;
    shortlisted?: string;
  }>;
};

const validSortOptions: RankingSortOption[] = [
  "overall",
  "rank",
  "skill",
  "ats",
  "experience",
  "newest",
];

function parseSortOption(value?: string): RankingSortOption {
  if (value && validSortOptions.includes(value as RankingSortOption)) {
    return value as RankingSortOption;
  }
  return "overall";
}

export default async function CandidateRankingsPage({
  searchParams,
}: CandidateRankingsPageProps) {
  const user = await requireRole("HR");
  const params = await searchParams;

  const sort = parseSortOption(params.sort);
  const minScore = params.minScore ? Number(params.minScore) : undefined;
  const shortlisted = params.shortlisted === "1";

  let data: Awaited<ReturnType<typeof getHRRankings>> = {
    rankings: [],
    jobs: [],
    spotlights: {
      topCandidate: null,
      bestSkillMatch: null,
      highestAts: null,
      newestCandidate: null,
    },
    totalCount: 0,
    filteredCount: 0,
  };

  try {
    data = await getHRRankings(user.id, {
      q: params.q,
      jobId: params.jobId,
      sort,
      minScore: Number.isFinite(minScore) ? minScore : undefined,
      shortlisted,
    });
  } catch {
    data = {
      rankings: [],
      jobs: [],
      spotlights: {
        topCandidate: null,
        bestSkillMatch: null,
        highestAts: null,
        newestCandidate: null,
      },
      totalCount: 0,
      filteredCount: 0,
    };
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Candidate Rankings
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Explore AI-ranked candidates across all jobs. Compare overall match,
            experience fit, ATS compatibility, and skill alignment with powerful
            search, filters, and sorting.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/dashboard/hr/jobs">Manage Jobs</Link>
        </Button>
      </div>

      <RankingSpotlightCards spotlights={data.spotlights} />

      <RankingSummaryStrip
        totalCount={data.totalCount}
        filteredCount={data.filteredCount}
      />

      <Suspense fallback={null}>
        <RankingToolbar
          jobs={data.jobs}
          initialQuery={params.q ?? ""}
          initialJobId={params.jobId ?? ""}
          initialSort={sort}
          initialMinScore={Number.isFinite(minScore) ? minScore : undefined}
          initialShortlisted={shortlisted}
        />
      </Suspense>

      <RankingList rankings={data.rankings} />
    </div>
  );
}
