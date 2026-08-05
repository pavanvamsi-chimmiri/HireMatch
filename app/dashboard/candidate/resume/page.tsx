import { UploadResumeClient } from "@/components/dashboard/candidate/upload-resume";
import { requireRole } from "@/lib/auth";
import { getCandidateResumes } from "@/lib/candidate/queries";
import { toAnalysisView } from "@/services/resume-analyzer.service";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const user = await requireRole("CANDIDATE");

  let resumes: Awaited<ReturnType<typeof getCandidateResumes>> = [];
  try {
    resumes = await getCandidateResumes(user.id);
  } catch {
    resumes = [];
  }

  const clientResumes = resumes.map((resume) => ({
    ...resume,
    analysis: resume.analyses[0] ? toAnalysisView(resume.analyses[0]) : null,
  }));

  return <UploadResumeClient resumes={clientResumes} />;
}
