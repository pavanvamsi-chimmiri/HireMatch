-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "parsedData" JSONB;
ALTER TABLE "jobs" ADD COLUMN "parsedAt" TIMESTAMP(3);
