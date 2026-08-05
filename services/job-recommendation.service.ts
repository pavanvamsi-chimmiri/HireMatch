import { prisma } from "@/lib/prisma";
import {
  buildCandidateMatchSummary,
  calculateCandidateJobMatch,
  calculateEducationMatch,
  calculateExperienceMatch,
  calculateLocationMatch,
  calculateProjectMatch,
  calculateSkillMatch,
  getJobRequirements,
  getResumeProfile,
} from "@/lib/matching/scores";
import type {
  CandidateJobMatchFactors,
  CandidateJobRecommendation,
} from "@/types/candidate-job-match";
import type { ParsedResumeData } from "@/types/resume";

type CandidateProfileContext = {
  location: string | null;
  openToRemote: boolean;
  openToRelocate: boolean;
  skills: string[];
  experienceYears: number | null;
};

function mergeResumeWithProfile(
  resumeProfile: ParsedResumeData | null,
  profile: CandidateProfileContext | null,
): ParsedResumeData | null {
  if (!resumeProfile && !profile) return null;

  return {
    name: resumeProfile?.name ?? null,
    phone: resumeProfile?.phone ?? null,
    email: resumeProfile?.email ?? null,
    education: resumeProfile?.education ?? [],
    skills: [
      ...new Set([
        ...(resumeProfile?.skills ?? []),
        ...(profile?.skills ?? []),
      ]),
    ],
    experience: resumeProfile?.experience ?? [],
    projects: resumeProfile?.projects ?? [],
    certifications: resumeProfile?.certifications ?? [],
    technologies: resumeProfile?.technologies ?? [],
    experienceYears:
      resumeProfile?.experienceYears ?? profile?.experienceYears ?? null,
  };
}

function getMatchedSkills(
  jobSkills: string[],
  jobTechnologies: string[],
  resumeProfile: ParsedResumeData | null,
): string[] {
  const required = [...jobSkills, ...jobTechnologies];
  const candidate = [
    ...(resumeProfile?.skills ?? []),
    ...(resumeProfile?.technologies ?? []),
  ];
  const normalizedCandidate = candidate.map((item) => item.toLowerCase());

  return required
    .filter((item) => {
      const target = item.toLowerCase();
      return normalizedCandidate.some(
        (candidateItem) =>
          candidateItem.includes(target) || target.includes(candidateItem),
      );
    })
    .filter((item, index, array) => array.indexOf(item) === index);
}

export function scoreJobForCandidate(
  job: {
    id: string;
    title: string;
    description: string;
    qualifications: string | null;
    responsibilities: string | null;
    experienceRequired: string | null;
    skillsRequired: string[];
    location: string | null;
    isRemote: boolean;
    parsedData: unknown;
  },
  resumeProfile: ParsedResumeData | null,
  profile: CandidateProfileContext | null,
): {
  factors: CandidateJobMatchFactors;
  summary: string;
  matchedSkills: string[];
} {
  const jobAnalysis = getJobRequirements(job.parsedData);
  const skillMatch = calculateSkillMatch(
    [...job.skillsRequired, ...jobAnalysis.skills],
    jobAnalysis.technologies,
    resumeProfile,
  );
  const experienceMatch = calculateExperienceMatch(
    job.experienceRequired,
    jobAnalysis,
    resumeProfile,
  );
  const educationMatch = calculateEducationMatch(jobAnalysis, resumeProfile);
  const projectMatch = calculateProjectMatch(
    [...job.skillsRequired, ...jobAnalysis.skills],
    jobAnalysis.technologies,
    resumeProfile,
  );
  const locationMatch = calculateLocationMatch(job, profile);

  const factors: CandidateJobMatchFactors = {
    overallMatch: 0,
    skillMatch,
    experienceMatch,
    educationMatch,
    projectMatch,
    locationMatch,
  };

  factors.overallMatch = calculateCandidateJobMatch(factors);

  const matchedSkills = getMatchedSkills(
    [...job.skillsRequired, ...jobAnalysis.skills],
    jobAnalysis.technologies,
    resumeProfile,
  );

  return {
    factors,
    matchedSkills,
    summary: buildCandidateMatchSummary(job.title, factors, matchedSkills),
  };
}

export async function getCandidateMatchingContext(candidateId: string) {
  const [profileRecord, resume, applications] = await Promise.all([
    prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
    }),
    prisma.resume.findFirst({
      where: {
        candidateId,
        status: "PARSED",
      },
      orderBy: [{ isPrimary: "desc" }, { uploadedAt: "desc" }],
    }),
    prisma.application.findMany({
      where: { candidateId },
      select: { id: true, jobId: true, status: true },
    }),
  ]);

  const profile: CandidateProfileContext | null = profileRecord
    ? {
        location: profileRecord.location,
        openToRemote: profileRecord.openToRemote,
        openToRelocate: profileRecord.openToRelocate,
        skills: profileRecord.skills,
        experienceYears: profileRecord.experienceYears,
      }
    : null;

  const resumeProfile = mergeResumeWithProfile(
    getResumeProfile(resume?.parsedData),
    profile,
  );

  return {
    profile,
    resume,
    resumeProfile,
    applications,
    applicationByJobId: new Map(
      applications.map((application) => [application.jobId, application]),
    ),
  };
}

export async function getJobRecommendationsForCandidate(
  candidateId: string,
): Promise<CandidateJobRecommendation[]> {
  const context = await getCandidateMatchingContext(candidateId);

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  const recommendations = jobs.map((job) => {
    const scored = scoreJobForCandidate(
      job,
      context.resumeProfile,
      context.profile,
    );
    const application = context.applicationByJobId.get(job.id);

    return {
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        isRemote: job.isRemote,
        employmentType: job.employmentType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        skillsRequired: job.skillsRequired,
        company: { name: job.company.name },
        _count: { applications: job._count.applications },
      },
      matchPercentage: scored.factors.overallMatch,
      factors: scored.factors,
      summary: scored.summary,
      matchedSkills: scored.matchedSkills,
      hasApplied: Boolean(application),
      applicationId: application?.id ?? null,
      applicationStatus: application?.status ?? null,
    };
  });

  return recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export async function scoreSingleJobForCandidate(
  candidateId: string,
  jobId: string,
) {
  const context = await getCandidateMatchingContext(candidateId);
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "OPEN" },
  });

  if (!job) return null;

  return scoreJobForCandidate(job, context.resumeProfile, context.profile);
}

export async function getCandidateJobRecommendation(
  candidateId: string,
  jobId: string,
): Promise<CandidateJobRecommendation | null> {
  const recommendations = await getJobRecommendationsForCandidate(candidateId);
  return recommendations.find((item) => item.job.id === jobId) ?? null;
}
