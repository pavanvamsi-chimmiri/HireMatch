import {
  ALLOWED_RESUME_EXTENSIONS,
  ALLOWED_RESUME_MIME_TYPES,
  MAX_RESUME_SIZE_BYTES,
} from "@/lib/resume/constants";

export type ResumeValidationResult =
  { valid: true; mimeType: string } | { valid: false; error: string };

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return fileName.slice(dotIndex).toLowerCase();
}

function inferMimeType(fileName: string): string | null {
  const extension = getExtension(fileName);
  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return null;
  }
}

export function validateResumeFile(
  fileName: string,
  fileSize: number,
  mimeType?: string | null,
): ResumeValidationResult {
  const extension = getExtension(fileName);

  if (
    !ALLOWED_RESUME_EXTENSIONS.includes(
      extension as (typeof ALLOWED_RESUME_EXTENSIONS)[number],
    )
  ) {
    return {
      valid: false,
      error: "Only PDF and DOCX files are supported.",
    };
  }

  if (fileSize <= 0) {
    return { valid: false, error: "The selected file is empty." };
  }

  if (fileSize > MAX_RESUME_SIZE_BYTES) {
    return { valid: false, error: "File size must be 10MB or less." };
  }

  const resolvedMimeType =
    mimeType && ALLOWED_RESUME_MIME_TYPES.includes(mimeType as never)
      ? mimeType
      : inferMimeType(fileName);

  if (
    !resolvedMimeType ||
    !ALLOWED_RESUME_MIME_TYPES.includes(resolvedMimeType as never)
  ) {
    return {
      valid: false,
      error: "Invalid file type. Only PDF and DOCX files are supported.",
    };
  }

  return { valid: true, mimeType: resolvedMimeType };
}

export function sanitizeResumeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 180);
}
