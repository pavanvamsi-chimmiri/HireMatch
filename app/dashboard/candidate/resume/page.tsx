import { requireRole } from "@/lib/auth";
import { getCandidateResumes } from "@/lib/candidate/queries";
import { UploadResumeClient } from "@/components/dashboard/candidate/upload-resume";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const user = await requireRole("CANDIDATE");

  let resumes: Awaited<ReturnType<typeof getCandidateResumes>> = [];
  try {
    resumes = await getCandidateResumes(user.id);
  } catch {
    resumes = [];
  }

  return <UploadResumeClient resumes={resumes} />;
}
