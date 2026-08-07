"use server";

import { revalidatePath } from "next/cache";
import type { ApplicationSource } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import {
  detectProfileSource,
  importCandidateForJob,
  resolveProfileUrls,
} from "@/lib/candidates/import";
import { parseCandidateCsv } from "@/lib/import/csv-parser";

export type CandidateImportActionState = {
  success?: boolean;
  error?: string;
  applicationId?: string;
  importedCount?: number;
  skippedCount?: number;
  errors?: string[];
};

function readResumeFromFormData(formData: FormData) {
  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

async function readResumeBuffer(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    buffer,
  };
}

export async function importCandidateAction(
  _prevState: CandidateImportActionState,
  formData: FormData,
): Promise<CandidateImportActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "HR") {
    return { error: "You must be signed in as an HR user." };
  }

  const jobId = formData.get("jobId")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const profileUrl = formData.get("profileUrl")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!jobId || !name || !email) {
    return { error: "Job, name, and email are required." };
  }

  const resumeFile = readResumeFromFormData(formData);
  if (!resumeFile) {
    return { error: "A resume file is required when importing a candidate." };
  }

  const { linkedinUrl, naukriUrl } = resolveProfileUrls({
    email,
    name,
    phone,
    profileUrl,
  });

  const detectedSource = detectProfileSource(profileUrl);
  const source: ApplicationSource = detectedSource ?? "HR_IMPORT";

  try {
    const resume = await readResumeBuffer(resumeFile);
    const { application } = await importCandidateForJob({
      hrUserId: user.id,
      jobId,
      candidate: {
        email,
        name,
        phone,
        linkedinUrl,
        naukriUrl,
        profileUrl,
      },
      resume,
      source,
      sourceUrl: profileUrl,
      hrNotes: notes,
    });

    revalidatePath("/dashboard/hr/applicants");
    revalidatePath("/dashboard/hr/rankings");
    revalidatePath(`/dashboard/hr/jobs/${jobId}`);
    revalidatePath("/dashboard/hr/import");

    return {
      success: true,
      applicationId: application.id,
    };
  } catch (error) {
    console.error("Failed to import candidate:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not import candidate. Please try again.",
    };
  }
}

export async function bulkImportCandidatesAction(
  _prevState: CandidateImportActionState,
  formData: FormData,
): Promise<CandidateImportActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "HR") {
    return { error: "You must be signed in as an HR user." };
  }

  const jobId = formData.get("jobId")?.toString().trim();
  const csvFile = formData.get("csvFile");

  if (!jobId) {
    return { error: "Select a job for this import." };
  }

  if (!(csvFile instanceof File) || csvFile.size === 0) {
    return { error: "Upload a CSV file to import candidates." };
  }

  const csvContent = await csvFile.text();
  const parsed = parseCandidateCsv(csvContent);

  if (parsed.rows.length === 0) {
    return {
      error:
        parsed.errors[0] ??
        "No valid candidate rows were found in the CSV file.",
    };
  }

  let importedCount = 0;
  let skippedCount = 0;
  const rowErrors: string[] = [...parsed.errors];

  for (const row of parsed.rows) {
    const profileUrl = row.linkedinUrl ?? row.naukriUrl;
    const detectedSource = detectProfileSource(profileUrl);
    const source: ApplicationSource = detectedSource ?? "CSV_BULK";

    try {
      await importCandidateForJob({
        hrUserId: user.id,
        jobId,
        candidate: {
          email: row.email,
          name: row.name,
          phone: row.phone,
          linkedinUrl: row.linkedinUrl,
          naukriUrl: row.naukriUrl,
          profileUrl,
        },
        source,
        sourceUrl: profileUrl,
        hrNotes: row.notes,
      });
      importedCount += 1;
    } catch (error) {
      skippedCount += 1;
      rowErrors.push(
        `Row ${row.rowNumber}: ${
          error instanceof Error ? error.message : "Import failed."
        }`,
      );
    }
  }

  revalidatePath("/dashboard/hr/applicants");
  revalidatePath("/dashboard/hr/rankings");
  revalidatePath(`/dashboard/hr/jobs/${jobId}`);
  revalidatePath("/dashboard/hr/import/bulk");

  if (importedCount === 0) {
    return {
      error: "No candidates were imported.",
      importedCount,
      skippedCount,
      errors: rowErrors.slice(0, 10),
    };
  }

  return {
    success: true,
    importedCount,
    skippedCount,
    errors: rowErrors.length > 0 ? rowErrors.slice(0, 10) : undefined,
  };
}
