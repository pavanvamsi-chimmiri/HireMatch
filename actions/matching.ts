"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { matchCandidatesForJob } from "@/services/candidate-matching.service";

export type MatchingActionState = {
  error?: string;
  success?: boolean;
  matchedCount?: number;
};

export async function runCandidateMatchingAction(
  jobId: string,
): Promise<MatchingActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "HR") {
    return { error: "You must be signed in as an HR user." };
  }

  try {
    const results = await matchCandidatesForJob(jobId, user.id);

    revalidatePath(`/dashboard/hr/jobs/${jobId}`);
    revalidatePath("/dashboard/hr/jobs");
    revalidatePath("/dashboard/hr/applicants");
    revalidatePath("/dashboard/hr/analytics");
    revalidatePath("/dashboard/hr/rankings");
    revalidatePath("/dashboard/hr");

    return {
      success: true,
      matchedCount: results.length,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Candidate matching failed.";
    return { error: message };
  }
}
