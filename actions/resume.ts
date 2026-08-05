"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteResumeFromStorage } from "@/lib/resume/storage";

export type ResumeActionState = {
  error?: string;
  success?: boolean;
};

export async function deleteResumeAction(
  resumeId: string,
): Promise<ResumeActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "CANDIDATE") {
    return { error: "You must be signed in as a candidate." };
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, candidateId: user.id },
  });

  if (!resume) {
    return { error: "Resume not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.resume.delete({ where: { id: resume.id } });

      if (resume.isPrimary) {
        const nextPrimary = await tx.resume.findFirst({
          where: { candidateId: user.id },
          orderBy: { uploadedAt: "desc" },
        });

        if (nextPrimary) {
          await tx.resume.update({
            where: { id: nextPrimary.id },
            data: { isPrimary: true },
          });
        }
      }
    });

    if (resume.storagePath) {
      await deleteResumeFromStorage(resume.storagePath).catch(() => undefined);
    }

    revalidatePath("/dashboard/candidate/resume");
    revalidatePath("/dashboard/candidate");

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete resume.";
    return { error: message };
  }
}

export async function setPrimaryResumeAction(
  resumeId: string,
): Promise<ResumeActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "CANDIDATE") {
    return { error: "You must be signed in as a candidate." };
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, candidateId: user.id },
  });

  if (!resume) {
    return { error: "Resume not found." };
  }

  try {
    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { candidateId: user.id },
        data: { isPrimary: false },
      }),
      prisma.resume.update({
        where: { id: resume.id },
        data: { isPrimary: true },
      }),
    ]);

    revalidatePath("/dashboard/candidate/resume");
    revalidatePath("/dashboard/candidate");

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update primary resume.";
    return { error: message };
  }
}
