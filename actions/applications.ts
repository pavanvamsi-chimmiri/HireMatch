"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  findOrCreateCandidateUser,
  uploadCandidateResume,
  createImportedApplication,
} from "@/lib/candidates/import";
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
      source: "DIRECT",
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

export async function applyToPublicJobAction(
  _prevState: ApplyJobActionState,
  formData: FormData,
): Promise<ApplyJobActionState> {
  const jobId = formData.get("jobId")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const coverLetter = formData.get("coverLetter")?.toString().trim() || null;
  const resumeFile = formData.get("resume");

  if (!jobId || !name || !email) {
    return { error: "Name and email are required." };
  }

  if (!(resumeFile instanceof File) || resumeFile.size === 0) {
    return { error: "Please upload your resume to apply." };
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "OPEN" },
    select: {
      id: true,
      title: true,
      postedById: true,
      company: { select: { slug: true } },
      slug: true,
    },
  });

  if (!job) {
    return { error: "This job is no longer accepting applications." };
  }

  const currentUser = await getCurrentUser();
  if (currentUser) {
    if (currentUser.role !== "CANDIDATE") {
      return {
        error: "Please sign out of your HR account before applying as a candidate.",
      };
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: currentUser.id,
        },
      },
    });

    if (existingApplication) {
      return { error: "You have already applied to this job." };
    }

    const resume = await prisma.resume.findFirst({
      where: {
        candidateId: currentUser.id,
        status: "PARSED",
      },
      orderBy: [{ isPrimary: "desc" }, { uploadedAt: "desc" }],
    });

    if (!resume) {
      return {
        error: "Upload and parse your resume in your dashboard before applying.",
      };
    }

    const scored = await scoreSingleJobForCandidate(currentUser.id, jobId);

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: currentUser.id,
        resumeId: resume.id,
        status: "PENDING",
        source: "PUBLIC",
        coverLetter,
        aiScore: scored?.factors.overallMatch ?? null,
        aiSummary: scored?.summary ?? null,
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: currentUser.id,
          type: "APPLICATION_UPDATE",
          title: "Application Submitted",
          message: `Your application for ${job.title} was submitted successfully.`,
          linkUrl: "/dashboard/candidate/applications",
        },
        {
          userId: job.postedById,
          type: "APPLICATION_UPDATE",
          title: "New Application Received",
          message: `${currentUser.name ?? currentUser.email} applied to ${job.title}.`,
          linkUrl: "/dashboard/hr/applicants",
        },
      ],
    });

    revalidatePath(`/jobs/${job.company.slug}/${job.slug}`);
    revalidatePath("/dashboard/candidate/applications");
    revalidatePath("/dashboard/hr/applicants");

    return { success: true, applicationId: application.id };
  }

  try {
    const candidate = await findOrCreateCandidateUser({ email, name, phone });
    const resume = await uploadCandidateResume(candidate.id, {
      fileName: resumeFile.name,
      fileSize: resumeFile.size,
      mimeType: resumeFile.type || "application/octet-stream",
      buffer: Buffer.from(await resumeFile.arrayBuffer()),
    });

    const application = await createImportedApplication({
      jobId: job.id,
      candidateId: candidate.id,
      resumeId: resume.id,
      source: "PUBLIC",
      coverLetter,
      postedById: job.postedById,
      candidateName: name,
      jobTitle: job.title,
    });

    await prisma.notification.create({
      data: {
        userId: candidate.id,
        type: "APPLICATION_UPDATE",
        title: "Application Submitted",
        message: `Your application for ${job.title} was submitted successfully.`,
        linkUrl: "/dashboard/candidate/applications",
      },
    });

    revalidatePath(`/jobs/${job.company.slug}/${job.slug}`);
    revalidatePath("/dashboard/hr/applicants");
    revalidatePath("/dashboard/hr/analytics");

    return {
      success: true,
      applicationId: application.id,
    };
  } catch (error) {
    console.error("Public job application failed:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not submit your application. Please try again.",
    };
  }
}
