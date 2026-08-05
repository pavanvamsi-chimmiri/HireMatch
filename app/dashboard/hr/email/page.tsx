import { requireRole } from "@/lib/auth";
import { getHRApplicants } from "@/lib/hr/queries";
import { EmailCandidatesForm } from "@/components/dashboard/hr/email-candidates-form";

export const dynamic = "force-dynamic";

export default async function EmailCandidatesPage() {
  const user = await requireRole("HR");

  let applicants: Awaited<ReturnType<typeof getHRApplicants>> = [];
  try {
    applicants = await getHRApplicants(user.id);
  } catch {
    applicants = [];
  }

  const candidates = applicants.map((application) => ({
    id: application.candidate.id,
    name: application.candidate.name,
    email: application.candidate.email,
    jobTitle: application.job.title,
  }));

  const uniqueCandidates = [
    ...new Map(
      candidates.map((candidate) => [candidate.id, candidate]),
    ).values(),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Candidates</h1>
        <p className="text-muted-foreground mt-2">
          Send interview invites, updates, and follow-ups to applicants.
        </p>
      </div>

      <EmailCandidatesForm candidates={uniqueCandidates} />
    </div>
  );
}
