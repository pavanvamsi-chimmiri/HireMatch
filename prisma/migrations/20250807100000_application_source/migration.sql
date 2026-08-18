-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('DIRECT', 'PUBLIC', 'HR_IMPORT', 'CSV_BULK', 'LINKEDIN', 'NAUKRI');

-- AlterTable
ALTER TABLE "applications" ADD COLUMN "source" "ApplicationSource" NOT NULL DEFAULT 'DIRECT';
ALTER TABLE "applications" ADD COLUMN "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN "naukriUrl" TEXT;
