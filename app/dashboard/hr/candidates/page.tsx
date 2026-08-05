import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { searchCandidates } from "@/lib/hr/queries";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

type CandidateSearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function CandidateSearchPage({
  searchParams,
}: CandidateSearchPageProps) {
  const user = await requireRole("HR");
  const { q } = await searchParams;

  let candidates: Awaited<ReturnType<typeof searchCandidates>> = [];
  try {
    candidates = await searchCandidates(user.id, q);
  } catch {
    candidates = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidate Search</h1>
        <p className="text-muted-foreground mt-2">
          Find talent in your pipeline by name, email, or skills.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Filter candidates connected to your hiring pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex flex-col gap-3 sm:flex-row">
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name, email, or skill..."
              className="flex-1"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white"
            >
              Search
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {candidates.length === 0 ? (
          <Card className="border-border/50 md:col-span-2 xl:col-span-3">
            <CardContent className="text-muted-foreground flex items-center justify-center py-16 text-sm">
              No candidates found.
            </CardContent>
          </Card>
        ) : (
          candidates.map((candidate) => (
            <Link
              key={candidate.id}
              href={`/dashboard/hr/candidates/${candidate.id}`}
            >
              <Card className="border-border/50 h-full transition-all hover:border-blue-500/30 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {candidate.name ?? "Unnamed Candidate"}
                  </CardTitle>
                  <CardDescription>{candidate.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.candidateProfile?.headline && (
                    <p className="text-sm">
                      {candidate.candidateProfile.headline}
                    </p>
                  )}

                  {candidate.candidateProfile?.skills.length ? (
                    <div className="flex flex-wrap gap-2">
                      {candidate.candidateProfile.skills
                        .slice(0, 6)
                        .map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  ) : null}

                  <p className="text-muted-foreground text-xs">
                    {candidate.applications.length} application
                    {candidate.applications.length === 1 ? "" : "s"} to your
                    jobs
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
