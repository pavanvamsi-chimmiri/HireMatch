import type { Prisma } from "@prisma/client";
import {
  parseResumeWithAI,
  parseResumeWithHeuristics,
} from "@/ai/parse-resume";
import { extractTextFromResumeBuffer } from "@/lib/resume/extract-text";
import { downloadResumeFromStorage } from "@/lib/resume/storage";
import { serverEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import type { ParsedExperience, ParsedResumeData } from "@/types/resume";

function calculateExperienceYears(
  experience: ParsedExperience[],
): number | null {
  if (experience.length === 0) return null;

  const currentYear = new Date().getFullYear();
  let totalYears = 0;

  for (const entry of experience) {
    const startYear = parseYear(entry.startDate);
    const endYear = parseYear(entry.endDate) ?? currentYear;

    if (startYear && endYear >= startYear) {
      totalYears += endYear - startYear;
    }
  }

  return totalYears > 0 ? totalYears : null;
}

function parseYear(value?: string | null): number | null {
  if (!value) return null;
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function mergeUniqueStrings(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const list of lists) {
    for (const item of list) {
      const normalized = item.trim();
      if (!normalized) continue;
      const key = normalized.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(normalized);
    }
  }

  return merged;
}

async function persistParsedData(
  userId: string,
  resumeId: string,
  parsedText: string,
  data: ParsedResumeData,
) {
  const experienceYears =
    data.experienceYears ?? calculateExperienceYears(data.experience);
  const skills = mergeUniqueStrings(data.skills, data.technologies);

  const parsedData: Prisma.InputJsonValue = {
    ...data,
    experienceYears,
  };

  await prisma.$transaction(async (tx) => {
    await tx.resume.update({
      where: { id: resumeId },
      data: {
        parsedText,
        parsedData,
        status: "PARSED",
        parsedAt: new Date(),
      },
    });

    const userUpdate: Prisma.UserUpdateInput = {};
    if (data.name) userUpdate.name = data.name;
    if (data.phone) userUpdate.phone = data.phone;

    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userUpdate,
      });
    }

    await tx.candidateProfile.upsert({
      where: { userId },
      update: {
        skills,
        certifications: data.certifications,
        education: data.education as Prisma.InputJsonValue,
        experienceYears,
      },
      create: {
        userId,
        skills,
        certifications: data.certifications,
        education: data.education as Prisma.InputJsonValue,
        experienceYears,
      },
    });
  });
}

export async function parseAndStoreResume(resumeId: string) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { candidate: true },
  });

  if (!resume?.storagePath || !resume.mimeType) {
    throw new Error("Resume file is not available for parsing.");
  }

  await prisma.resume.update({
    where: { id: resumeId },
    data: { status: "PROCESSING" },
  });

  try {
    const file = await downloadResumeFromStorage(resume.storagePath);
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedText = await extractTextFromResumeBuffer(
      buffer,
      resume.mimeType,
    );

    if (!parsedText) {
      throw new Error("No readable text found in the resume.");
    }

    let parsedData: ParsedResumeData;

    if (serverEnv.OPENAI_API_KEY) {
      try {
        parsedData = await parseResumeWithAI(parsedText);
      } catch {
        parsedData = parseResumeWithHeuristics(parsedText);
      }
    } else {
      parsedData = parseResumeWithHeuristics(parsedText);
    }

    await persistParsedData(
      resume.candidateId,
      resumeId,
      parsedText,
      parsedData,
    );

    return parsedData;
  } catch (error) {
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "FAILED" },
    });

    throw error;
  }
}

export function scheduleResumeParsing(resumeId: string) {
  void parseAndStoreResume(resumeId).catch((error) => {
    console.error(`Resume parsing failed for ${resumeId}:`, error);
  });
}
