/**
 * Server-side functional test for import flows (no browser).
 * Run: npx tsx scripts/test-import-flows.ts
 */
import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import AdmZip from "adm-zip";
import { PrismaClient } from "@prisma/client";
import { parseCandidateCsv } from "../lib/import/csv-parser";
import { parseResumeZip } from "../lib/import/resume-zip";
import { importCandidateForJob } from "../lib/candidates/import";

const prisma = new PrismaClient();
const HR_EMAIL = "pavanvamsichimmiri2@gmail.com";

async function main() {
  const hr = await prisma.user.findUnique({ where: { email: HR_EMAIL } });
  if (!hr) throw new Error("HR user missing");

  const job = await prisma.job.findFirst({
    where: { postedById: hr.id, status: "OPEN" },
  });
  if (!job) throw new Error("Open job missing - run setup-test-data.mjs");

  const tmp = join(process.cwd(), ".tmp-import-test");
  mkdirSync(tmp, { recursive: true });
  const pdf = join(tmp, "script.test@hirematch.test.pdf");
  writeFileSync(pdf, "%PDF-1.4 script import test");

  console.log("1. CSV parser...");
  const csv = parseCandidateCsv(
    "Name,Email\nScript Test,script.csv@hirematch.test",
  );
  if (csv.rows.length !== 1) throw new Error("CSV parser failed");
  console.log("   ✅ CSV parser");

  console.log("2. ZIP matcher...");
  const zip = new AdmZip();
  zip.addLocalFile(pdf);
  const zipResult = parseResumeZip(zip.toBuffer());
  if (!zipResult.resumeMap.has("script.test@hirematch.test")) {
    throw new Error("ZIP matcher failed");
  }
  console.log("   ✅ ZIP matcher");

  console.log("3. Single import with resume...");
  const resume = zipResult.resumeMap.get("script.test@hirematch.test")!;
  await importCandidateForJob({
    hrUserId: hr.id,
    jobId: job.id,
    candidate: {
      email: "script.single@hirematch.test",
      name: "Script Single Import",
      profileUrl: "https://linkedin.com/in/scriptsingle",
    },
    resume: {
      fileName: resume.fileName,
      fileSize: resume.fileSize,
      mimeType: resume.mimeType,
      buffer: resume.buffer,
    },
    source: "HR_IMPORT",
    sourceUrl: "https://linkedin.com/in/scriptsingle",
  });
  console.log("   ✅ Single import");

  console.log("4. Bulk import without resume...");
  await importCandidateForJob({
    hrUserId: hr.id,
    jobId: job.id,
    candidate: {
      email: "script.bulk@hirematch.test",
      name: "Script Bulk Import",
    },
    source: "CSV_BULK",
  });
  console.log("   ✅ Bulk import (no resume)");

  const count = await prisma.application.count({
    where: { jobId: job.id },
  });
  console.log(`\n✅ All import flow tests passed (${count} applications on job)`);

  rmSync(tmp, { recursive: true, force: true });
}

main()
  .catch((error) => {
    console.error("❌", error.message ?? error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
