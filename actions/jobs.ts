"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EmploymentType, JobStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type JobActionState = {
  error?: string;
  success?: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseEmploymentType(value: FormDataEntryValue | null): EmploymentType {
  if (
    value === "FULL_TIME" ||
    value === "PART_TIME" ||
    value === "CONTRACT" ||
    value === "INTERNSHIP" ||
    value === "REMOTE"
  ) {
    return value;
  }
  return "FULL_TIME";
}

function parseJobStatus(value: FormDataEntryValue | null): JobStatus {
  if (value === "DRAFT" || value === "OPEN") {
    return value;
  }
  return "DRAFT";
}

export async function createJobAction(
  _prevState: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "HR") {
    return { error: "You must be signed in as an HR user." };
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const requirements = formData.get("requirements")?.toString().trim() || null;
  const responsibilities =
    formData.get("responsibilities")?.toString().trim() || null;
  const location = formData.get("location")?.toString().trim() || null;
  const skillsRaw = formData.get("skillsRequired")?.toString().trim() ?? "";
  const salaryMinRaw = formData.get("salaryMin")?.toString().trim();
  const salaryMaxRaw = formData.get("salaryMax")?.toString().trim();
  const employmentType = parseEmploymentType(formData.get("employmentType"));
  const status = parseJobStatus(formData.get("status"));
  const isRemote = formData.get("isRemote") === "on";

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  const skillsRequired = skillsRaw
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const salaryMin = salaryMinRaw ? Number(salaryMinRaw) : null;
  const salaryMax = salaryMaxRaw ? Number(salaryMaxRaw) : null;

  if (
    (salaryMin !== null && Number.isNaN(salaryMin)) ||
    (salaryMax !== null && Number.isNaN(salaryMax))
  ) {
    return { error: "Salary values must be valid numbers." };
  }

  const hrProfile = await prisma.hRProfile.findUnique({
    where: { userId: user.id },
    include: { company: true },
  });

  if (!hrProfile?.companyId) {
    return {
      error: "Your HR profile is missing a company. Complete settings first.",
    };
  }

  const baseSlug = slugify(title);
  let slug = baseSlug || "job";
  let suffix = 1;

  while (
    await prisma.job.findFirst({
      where: { companyId: hrProfile.companyId, slug },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  try {
    await prisma.job.create({
      data: {
        title,
        slug,
        description,
        requirements,
        responsibilities,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        status,
        isRemote,
        skillsRequired,
        companyId: hrProfile.companyId,
        postedById: user.id,
        publishedAt: status === "OPEN" ? new Date() : null,
      },
    });

    revalidatePath("/dashboard/hr");
    revalidatePath("/dashboard/hr/jobs");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create job.";
    return { error: message };
  }

  redirect("/dashboard/hr/jobs");
}

export async function updateJobStatusAction(
  jobId: string,
  status: JobStatus,
): Promise<JobActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "HR") {
    return { error: "You must be signed in as an HR user." };
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, postedById: user.id },
  });

  if (!job) {
    return { error: "Job not found." };
  }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status,
      publishedAt:
        status === "OPEN" && !job.publishedAt ? new Date() : job.publishedAt,
      closedAt: status === "CLOSED" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/hr/jobs");
  revalidatePath("/dashboard/hr");

  return { success: true };
}
