import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ImportCandidateForm } from "@/components/dashboard/hr/import-candidate-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ImportCandidatePage() {
  const user = await requireRole("HR");

  const jobs = await prisma.job.findMany({
    where: { postedById: user.id },
    include: { company: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Import Candidate
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Add candidates from LinkedIn, Naukri, or referrals by pasting their
            profile URL and uploading their resume.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/hr/import/bulk">Bulk CSV Import</Link>
        </Button>
      </div>

      <ImportCandidateForm
        jobs={jobs.map((job) => ({
          id: job.id,
          title: job.title,
          companyName: job.company.name,
          status: job.status,
        }))}
      />
    </div>
  );
}
