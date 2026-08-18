import { randomBytes } from "crypto";
import { after } from "next/server";
import { type ApplicationSource } from "@prisma/client";
import { syncUserFromSupabase } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildResumeStoragePath,
  uploadResumeToStorage,
} from "@/lib/resume/storage";
import { validateResumeFile } from "@/lib/resume/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseAndStoreResume } from "@/services/resume-parser.service";
import { scoreSingleJobForCandidate } from "@/services/job-recommendation.service";

export type CandidateImportInput = {
  email: string;
  name: string;
  phone?: string | null;
  linkedinUrl?: string | null;
  naukriUrl?: string | null;
  profileUrl?: string | null;
};

export type ImportResumeInput = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  buffer: Buffer;
};

export function detectProfileSource(
  profileUrl?: string | null,
): ApplicationSource | null {
  if (!profileUrl) {
    return null;
  }

  const normalized = profileUrl.toLowerCase();
  if (normalized.includes("linkedin.com")) {
    return "LINKEDIN";
  }
  if (normalized.includes("naukri.com")) {
    return "NAUKRI";
  }

  return null;
}

export function resolveProfileUrls(input: CandidateImportInput) {
  const profileUrl = input.profileUrl?.trim() || null;
  const linkedinUrl =
    input.linkedinUrl?.trim() ||
    (profileUrl?.toLowerCase().includes("linkedin.com") ? profileUrl : null);
  const naukriUrl =
    input.naukriUrl?.trim() ||
    (profileUrl?.toLowerCase().includes("naukri.com") ? profileUrl : null);

  return { linkedinUrl, naukriUrl, profileUrl };
}

function generateImportPassword() {
  return randomBytes(24).toString("base64url");
}

export async function findOrCreateCandidateUser(input: CandidateImportInput) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const phone = input.phone?.trim() || null;
  const { linkedinUrl, naukriUrl } = resolveProfileUrls(input);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { candidateProfile: true },
  });

  if (existingUser) {
    if (existingUser.role !== "CANDIDATE") {
      throw new Error(
        `An account with ${email} already exists as a non-candidate user.`,
      );
    }

    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: name || existingUser.name,
        phone: phone ?? existingUser.phone,
      },
    });

    await prisma.candidateProfile.upsert({
      where: { userId: updated.id },
      update: {
        linkedinUrl: linkedinUrl ?? undefined,
        naukriUrl: naukriUrl ?? undefined,
      },
      create: {
        userId: updated.id,
        linkedinUrl,
        naukriUrl,
      },
    });

    return updated;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error(
      "Supabase admin is not configured. Add SUPABASE_SERVICE_ROLE_KEY to import candidates.",
    );
  }

  const password = generateImportPassword();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: "CANDIDATE",
      profile_completed: true,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create candidate account.");
  }

  const user = await syncUserFromSupabase(data.user.id, email, {
    name,
    role: "CANDIDATE",
    profile_completed: true,
  });

  if (!user) {
    throw new Error("Failed to sync imported candidate to the database.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { phone },
  });

  await prisma.candidateProfile.update({
    where: { userId: user.id },
    data: { linkedinUrl, naukriUrl },
  });

  return user;
}

export async function uploadCandidateResume(
  candidateId: string,
  resume: ImportResumeInput,
  options?: { awaitParse?: boolean },
) {
  const validation = validateResumeFile(
    resume.fileName,
    resume.fileSize,
    resume.mimeType,
  );

  if (!validation.valid) {
    throw new Error(validation.error ?? "Invalid resume file.");
  }

  const storagePath = buildResumeStoragePath(candidateId, resume.fileName);
  await uploadResumeToStorage(storagePath, resume.buffer, validation.mimeType);

  const resumeCount = await prisma.resume.count({
    where: { candidateId },
  });

  const created = await prisma.resume.create({
    data: {
      candidateId,
      fileName: resume.fileName,
      fileUrl: storagePath,
      storagePath,
      fileSize: resume.fileSize,
      mimeType: validation.mimeType,
      isPrimary: resumeCount === 0,
    },
  });

  if (options?.awaitParse) {
    await parseAndStoreResume(created.id);
  } else {
    after(async () => {
      try {
        await parseAndStoreResume(created.id);
      } catch (error) {
        console.error("Resume parsing failed for imported candidate:", error);
      }
    });
  }

  return created;
}

export async function createImportedApplication(input: {
  jobId: string;
  candidateId: string;
  resumeId?: string | null;
  source: ApplicationSource;
  sourceUrl?: string | null;
  coverLetter?: string | null;
  hrNotes?: string | null;
  postedById: string;
  candidateName: string;
  jobTitle: string;
}) {
  const existingApplication = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId: input.jobId,
        candidateId: input.candidateId,
      },
    },
  });

  if (existingApplication) {
    throw new Error("This candidate has already been added to this job.");
  }

  let aiScore: number | null = null;
  let aiSummary: string | null = null;

  if (input.resumeId) {
    const scored = await scoreSingleJobForCandidate(
      input.candidateId,
      input.jobId,
    );
    aiScore = scored?.factors.overallMatch ?? null;
    aiSummary = scored?.summary ?? null;
  }

  const application = await prisma.application.create({
    data: {
      jobId: input.jobId,
      candidateId: input.candidateId,
      resumeId: input.resumeId ?? null,
      status: "PENDING",
      source: input.source,
      sourceUrl: input.sourceUrl ?? null,
      coverLetter: input.coverLetter ?? null,
      hrNotes: input.hrNotes ?? null,
      aiScore,
      aiSummary,
    },
  });

  await prisma.notification.create({
    data: {
      userId: input.postedById,
      type: "APPLICATION_UPDATE",
      title: "New Application Received",
      message: `${input.candidateName} was added to ${input.jobTitle}.`,
      linkUrl: "/dashboard/hr/applicants",
    },
  });

  return application;
}

export async function verifyHRJobAccess(jobId: string, hrUserId: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, postedById: hrUserId },
    select: {
      id: true,
      title: true,
      postedById: true,
      status: true,
      company: { select: { slug: true } },
      slug: true,
    },
  });

  if (!job) {
    throw new Error("Job not found or you do not have access to it.");
  }

  return job;
}

export async function importCandidateForJob(input: {
  hrUserId: string;
  jobId: string;
  candidate: CandidateImportInput;
  resume?: ImportResumeInput | null;
  source: ApplicationSource;
  sourceUrl?: string | null;
  hrNotes?: string | null;
}) {
  const job = await verifyHRJobAccess(input.jobId, input.hrUserId);
  const user = await findOrCreateCandidateUser(input.candidate);

  let resumeId: string | null = null;
  if (input.resume) {
    const resume = await uploadCandidateResume(user.id, input.resume, {
      awaitParse: true,
    });
    resumeId = resume.id;
  }

  const application = await createImportedApplication({
    jobId: job.id,
    candidateId: user.id,
    resumeId,
    source: input.source,
    sourceUrl: input.sourceUrl ?? input.candidate.profileUrl ?? null,
    hrNotes: input.hrNotes ?? null,
    postedById: job.postedById,
    candidateName: input.candidate.name,
    jobTitle: job.title,
  });

  return { user, application, job };
}
