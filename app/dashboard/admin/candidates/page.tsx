import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { getAdminCandidates } from "@/lib/admin/queries";
import { AdminSearchForm } from "@/components/dashboard/admin/admin-search-form";
import { UserStatusToggle } from "@/components/dashboard/admin/user-status-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

type CandidatesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminCandidatesPage({
  searchParams,
}: CandidatesPageProps) {
  await requireRole("ADMIN");
  const { q } = await searchParams;

  let candidates: Awaited<ReturnType<typeof getAdminCandidates>> = [];
  try {
    candidates = await getAdminCandidates(q);
  } catch {
    candidates = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-2">
            Manage candidate accounts, profiles, resumes, and applications.
          </p>
        </div>
        <Suspense fallback={null}>
          <AdminSearchForm
            placeholder="Search candidates by name or email..."
            defaultValue={q ?? ""}
          />
        </Suspense>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Candidate Accounts</CardTitle>
          <CardDescription>
            {candidates.length} candidate{candidates.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No candidates found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Headline</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {candidate.name ?? candidate.email}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {candidate.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {candidate.candidateProfile?.headline ?? "—"}
                    </TableCell>
                    <TableCell>
                      {candidate.candidateProfile?.location ?? "—"}
                    </TableCell>
                    <TableCell>
                      {candidate.candidateProfile?.experienceYears != null
                        ? `${candidate.candidateProfile.experienceYears} yrs`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {candidate._count.applications} apps ·{" "}
                      {candidate._count.resumes} resumes
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={candidate.isActive ? "secondary" : "outline"}
                        className={
                          candidate.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "text-muted-foreground"
                        }
                      >
                        {candidate.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <UserStatusToggle
                        userId={candidate.id}
                        isActive={candidate.isActive}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
