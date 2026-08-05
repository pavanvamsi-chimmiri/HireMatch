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

function parseSalary(value: string | null) {
  if (!value) {
    return { salaryMin: null, salaryMax: null };
  }

  const numbers = value
    .match(/\d[\d,]*/g)
    ?.map((part) => Number(part.replace(/,/g, "")));

  if (!numbers?.length) {
    return { salaryMin: null, salaryMax: null };
  }

  if (numbers.length === 1) {
    return { salaryMin: numbers[0], salaryMax: numbers[0] };
  }

  return {
    salaryMin: Math.min(numbers[0], numbers[1]),
    salaryMax: Math.max(numbers[0], numbers[1]),
  };
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
  const companyId = formData.get("companyId")?.toString().trim();
  const location = formData.get("location")?.toString().trim() || null;
  const experienceRequired =
    formData.get("experienceRequired")?.toString().trim() || null;
  const salaryRaw = formData.get("salary")?.toString().trim() ?? "";
  const employmentType = parseEmploymentType(formData.get("employmentType"));
  const skillsRaw = formData.get("skillsRequired")?.toString().trim() ?? "";
  const responsibilities =
    formData.get("responsibilities")?.toString().trim() || null;
  const qualifications =
    formData.get("qualifications")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim();
  const status = parseJobStatus(formData.get("status"));

  if (!title) {
    return { error: "Job title is required." };
  }

  if (!companyId) {
    return { error: "Company is required." };
  }

  if (!description) {
    return { error: "Complete job description is required." };
  }

  const hrProfile = await prisma.hRProfile.findUnique({
    where: { userId: user.id },
  });

  if (!hrProfile?.companyId) {
    return {
      error: "Your HR profile is missing a company. Complete settings first.",
    };
  }

  if (companyId !== hrProfile.companyId) {
    return { error: "You can only post jobs for your assigned company." };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return { error: "Selected company was not found." };
  }

  const skillsRequired = skillsRaw
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const { salaryMin, salaryMax } = parseSalary(salaryRaw || null);
  const isRemote =
    employmentType === "REMOTE" ||
    location?.toLowerCase().includes("remote") ||
    false;

  const baseSlug = slugify(title);
  let slug = baseSlug || "job";
  let suffix = 1;

  while (
    await prisma.job.findFirst({
      where: { companyId, slug },
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
        qualifications,
        experienceRequired,
        responsibilities,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        status,
        isRemote,
        skillsRequired,
        companyId,
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
