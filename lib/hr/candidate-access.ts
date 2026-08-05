import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function canHRAccessCandidate(
  hrUserId: string,
  candidateId: string,
): Promise<boolean> {
  const [application, ranking] = await Promise.all([
    prisma.application.findFirst({
      where: {
        candidateId,
        job: { postedById: hrUserId },
      },
      select: { id: true },
    }),
    prisma.candidateRanking.findFirst({
      where: {
        candidateId,
        job: { postedById: hrUserId },
      },
      select: { id: true },
    }),
  ]);

  return Boolean(application || ranking);
}

export async function getResumeForUserAccess(
  userId: string,
  userRole: UserRole,
  resumeId: string,
) {
  if (userRole === "CANDIDATE") {
    return prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: userId,
      },
    });
  }

  if (userRole === "HR") {
    return prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidate: {
          OR: [
            {
              applications: {
                some: { job: { postedById: userId } },
              },
            },
            {
              rankings: {
                some: { job: { postedById: userId } },
              },
            },
          ],
        },
      },
    });
  }

  return null;
}
