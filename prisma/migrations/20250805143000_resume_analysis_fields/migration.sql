-- AlterTable
ALTER TABLE "resume_analyses" ADD COLUMN "atsScore" DOUBLE PRECISION;
ALTER TABLE "resume_analyses" ADD COLUMN "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "resume_analyses" ADD COLUMN "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "resume_analyses" ADD COLUMN "suggestedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "resume_analyses" ADD COLUMN "recommendedCertifications" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "resume_analyses" ADD COLUMN "recommendedProjects" JSONB;
