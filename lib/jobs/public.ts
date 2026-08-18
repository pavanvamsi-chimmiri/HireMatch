import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export function buildPublicJobUrl(companySlug: string, jobSlug: string) {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${base}/jobs/${companySlug}/${jobSlug}`;
}

export async function getPublicJob(companySlug: string, jobSlug: string) {
  const job = await prisma.job.findFirst({
    where: {
      slug: jobSlug,
      status: "OPEN",
      company: { slug: companySlug },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          website: true,
          industry: true,
          location: true,
        },
      },
    },
  });

  return job;
}

export async function incrementJobViewCount(jobId: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getOpenJobsForSitemap() {
  return prisma.job.findMany({
    where: { status: "OPEN" },
    select: {
      slug: true,
      updatedAt: true,
      company: { select: { slug: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
}
