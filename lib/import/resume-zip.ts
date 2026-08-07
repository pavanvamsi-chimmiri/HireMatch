import AdmZip from "adm-zip";
import { ALLOWED_RESUME_EXTENSIONS } from "@/lib/resume/constants";
import { validateResumeFile } from "@/lib/resume/validation";

export type ZipResumeFile = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  buffer: Buffer;
  matchedEmail: string;
};

const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

function getExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) {
    return "";
  }
  return fileName.slice(dotIndex).toLowerCase();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function extractEmailFromFileName(fileName: string): string | null {
  const baseName = fileName.split(/[/\\]/).pop() ?? fileName;
  const withoutExtension = baseName.replace(/\.[^.]+$/, "");

  const directMatch = withoutExtension.match(EMAIL_REGEX);
  if (directMatch) {
    return normalizeEmail(directMatch[0]);
  }

  const sanitized = withoutExtension.replace(/\s+/g, "").replace(/_/g, ".");
  const sanitizedMatch = sanitized.match(EMAIL_REGEX);
  if (sanitizedMatch) {
    return normalizeEmail(sanitizedMatch[0]);
  }

  return null;
}

export function parseResumeZip(buffer: Buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const resumes: ZipResumeFile[] = [];
  const errors: string[] = [];
  const seenEmails = new Set<string>();

  for (const entry of entries) {
    if (entry.isDirectory) {
      continue;
    }

    const fileName = entry.entryName.split(/[/\\]/).pop() ?? entry.entryName;
    const extension = getExtension(fileName);

    if (
      !ALLOWED_RESUME_EXTENSIONS.includes(
        extension as (typeof ALLOWED_RESUME_EXTENSIONS)[number],
      )
    ) {
      continue;
    }

    const matchedEmail = extractEmailFromFileName(fileName);
    if (!matchedEmail) {
      errors.push(
        `Skipped "${fileName}": filename must contain the candidate email (e.g. jane@example.com.pdf).`,
      );
      continue;
    }

    if (seenEmails.has(matchedEmail)) {
      errors.push(
        `Skipped duplicate resume for ${matchedEmail} ("${fileName}").`,
      );
      continue;
    }

    const fileBuffer = entry.getData();
    const validation = validateResumeFile(
      fileName,
      fileBuffer.length,
      undefined,
    );

    if (!validation.valid) {
      errors.push(`Skipped "${fileName}": ${validation.error}`);
      continue;
    }

    seenEmails.add(matchedEmail);
    resumes.push({
      fileName,
      fileSize: fileBuffer.length,
      mimeType: validation.mimeType,
      buffer: fileBuffer,
      matchedEmail,
    });
  }

  if (resumes.length === 0 && errors.length === 0) {
    errors.push(
      "No valid resume files found in the ZIP. Use PDF/DOC/DOCX files named with candidate emails.",
    );
  }

  return {
    resumes,
    errors,
    resumeMap: new Map(resumes.map((resume) => [resume.matchedEmail, resume])),
  };
}

export function getResumeForEmail(
  resumeMap: Map<string, ZipResumeFile>,
  email: string,
) {
  return resumeMap.get(normalizeEmail(email)) ?? null;
}
