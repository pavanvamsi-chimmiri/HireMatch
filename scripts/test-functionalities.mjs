#!/usr/bin/env node
/**
 * Functional smoke test for HireMatch features.
 * Run: node scripts/test-functionalities.mjs
 */

import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import AdmZip from "adm-zip";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3001";
const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`❌ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchStatus(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.status;
}

async function testServerRoutes() {
  for (const [path, label] of [
    ["/", "Landing page"],
    ["/login", "Login page"],
    ["/register", "Register page"],
    ["/dashboard/hr/import", "HR import page"],
    ["/dashboard/hr/import/bulk", "HR bulk import page"],
  ]) {
    const status = await fetchStatus(path);
    if (status === 200 || status === 307) pass(label, `${status}`);
    else fail(label, `${status}`);
  }
}

async function testCsvParser() {
  const { parseCandidateCsv } = await import("../lib/import/csv-parser.ts");
  const csv = `Name,Email,Phone\nAlice Test,alice@hirematch.test,9000000001`;
  const parsed = parseCandidateCsv(csv);
  if (parsed.rows.length === 1) pass("CSV parser");
  else fail("CSV parser", JSON.stringify(parsed));
}

async function testResumeZipParser() {
  const { parseResumeZip } = await import("../lib/import/resume-zip.ts");
  const tmpDir = join(process.cwd(), ".tmp-test-zip");
  mkdirSync(tmpDir, { recursive: true });
  const pdfPath = join(tmpDir, "alice@hirematch.test.pdf");
  writeFileSync(pdfPath, "%PDF-1.4 sample resume");

  const zip = new AdmZip();
  zip.addLocalFile(pdfPath);
  const result = parseResumeZip(zip.toBuffer());
  rmSync(tmpDir, { recursive: true, force: true });

  if (result.resumes[0]?.matchedEmail === "alice@hirematch.test") {
    pass("Resume ZIP email matcher");
  } else {
    fail("Resume ZIP email matcher");
  }
}

async function testDatabaseAndPublicJob() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    pass("Database connectivity");

    const openJob = await prisma.job.findFirst({
      where: { status: "OPEN" },
      include: { company: { select: { slug: true } } },
    });

    if (!openJob) {
      fail("Open job exists", "Run node scripts/setup-test-data.mjs first");
      return;
    }

    pass("Open job in database", openJob.title);
    const path = `/jobs/${openJob.company.slug}/${openJob.slug}`;
    const status = await fetchStatus(path);
    if (status === 200) pass("Public job page", path);
    else fail("Public job page", `${status}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log(`\nHireMatch smoke test @ ${BASE_URL}\n`);
  try {
    execSync("node scripts/setup-test-data.mjs", { stdio: "pipe" });
    pass("Test data setup");
  } catch (error) {
    fail("Test data setup", error.stderr?.toString() || error.message);
  }

  await testServerRoutes();
  await testCsvParser();
  await testResumeZipParser();
  await testDatabaseAndPublicJob();

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
