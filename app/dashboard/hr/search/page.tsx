import { requireRole } from "@/lib/auth";
import { GlobalSearchForm } from "@/components/dashboard/hr/global-search-form";
import { GlobalSearchResults } from "@/components/dashboard/hr/global-search-results";
import { searchCandidatesGlobally } from "@/services/candidate-search.service";
import type { CandidateSearchResponse } from "@/types/candidate-search";

export const dynamic = "force-dynamic";

type GlobalSearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function GlobalSearchPage({
  searchParams,
}: GlobalSearchPageProps) {
  const user = await requireRole("HR");
  const { q } = await searchParams;

  let data: CandidateSearchResponse = {
    query: q?.trim() ?? "",
    results: [],
    totalCandidates: 0,
    usedEmbeddings: false,
  };

  if (q?.trim()) {
    try {
      data = await searchCandidatesGlobally(user.id, q);
    } catch {
      data = {
        query: q.trim(),
        results: [],
        totalCandidates: 0,
        usedEmbeddings: false,
      };
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Search</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Search candidates using semantic vector embeddings combined with
          skills, experience, education, projects, location, and ATS score — not
          keyword search only.
        </p>
      </div>

      <GlobalSearchForm initialQuery={q ?? ""} />

      <GlobalSearchResults data={data} />
    </div>
  );
}
