import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getHRCandidateProfile } from "@/lib/hr/queries";
import { HRCandidateProfileView } from "@/components/dashboard/hr/candidate-profile-view";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type HRCandidateProfilePageProps = {
  params: Promise<{ candidateId: string }>;
  searchParams: Promise<{ jobId?: string }>;
};

export default async function HRCandidateProfilePage({
  params,
  searchParams,
}: HRCandidateProfilePageProps) {
  const user = await requireRole("HR");
  const { candidateId } = await params;
  const { jobId } = await searchParams;

  const profile = await getHRCandidateProfile(user.id, candidateId, jobId);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/dashboard/hr/rankings">
          <ArrowLeft className="mr-2 size-4" />
          Back to rankings
        </Link>
      </Button>

      <HRCandidateProfileView profile={profile} />
    </div>
  );
}
