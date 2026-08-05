"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreSingleJobForCandidate } from "@/services/job-recommendation.service";

export type ApplyJobActionState = {
  error?: string;
  success?: boolean;
  applicationId?: string;
};

export async function applyToJobAction(
  jobId: string,
): Promise<ApplyJobActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "CANDIDATE") {
    return { error: "You must be signed in as a candidate." };
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "OPEN" },
    select: { id: true, title: true, postedById: true },
  });

  if (!job) {
    return { error: "This job is not available." };
  }

  const existingApplication = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId,
        candidateId: user.id,
      },
    },
  });

  if (existingApplication) {
    return { error: "You have already applied to this job." };
  }

  const resume = await prisma.resume.findFirst({
    where: {
      candidateId: user.id,
      status: "PARSED",
    },
    orderBy: [{ isPrimary: "desc" }, { uploadedAt: "desc" }],
  });

  if (!resume) {
    return {
      error: "Upload and parse your resume before applying to jobs.",
    };
  }

  const scored = await scoreSingleJobForCandidate(user.id, jobId);

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: user.id,
      resumeId: resume.id,
      status: "PENDING",
      aiScore: scored?.factors.overallMatch ?? null,
      aiSummary: scored?.summary ?? null,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: "APPLICATION_UPDATE",
        title: "Application Submitted",
        message: `Your application for ${job.title} was submitted successfully.`,
        linkUrl: "/dashboard/candidate/applications",
      },
      {
        userId: job.postedById,
        type: "APPLICATION_UPDATE",
        title: "New Application Received",
        message: `${user.name ?? user.email} applied to ${job.title}.`,
        linkUrl: "/dashboard/hr/applicants",
      },
    ],
  });

  revalidatePath("/dashboard/candidate/jobs");
  revalidatePath("/dashboard/candidate/applications");
  revalidatePath("/dashboard/candidate");
  revalidatePath("/dashboard/hr/applicants");
  revalidatePath("/dashboard/hr/analytics");

  return {
    success: true,
    applicationId: application.id,
  };
}
