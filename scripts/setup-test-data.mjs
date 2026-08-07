/**
 * Seeds sample company + open job for HR functional testing.
 * Run: node scripts/setup-test-data.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const HR_EMAIL = process.env.HR_EMAIL ?? "pavanvamsichimmiri2@gmail.com";

async function main() {
  const hrUser = await prisma.user.findUnique({
    where: { email: HR_EMAIL },
    include: { hrProfile: { include: { company: true } } },
  });

  if (!hrUser || hrUser.role !== "HR") {
    throw new Error(`HR user not found: ${HR_EMAIL}`);
  }

  let company = hrUser.hrProfile?.company;

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "HireMatch Labs",
        slug: "hirematch-labs",
        website: "https://hirematch.test",
        industry: "Technology",
        location: "Hyderabad, India",
      },
    });

    await prisma.hRProfile.upsert({
      where: { userId: hrUser.id },
      update: { companyId: company.id },
      create: { userId: hrUser.id, companyId: company.id },
    });

    console.log("Created company:", company.name);
  } else {
    console.log("Using existing company:", company.name);
  }

  let job = await prisma.job.findFirst({
    where: {
      companyId: company.id,
      postedById: hrUser.id,
      status: "OPEN",
    },
  });

  if (!job) {
    job = await prisma.job.create({
      data: {
        title: "QA Test Engineer",
        slug: "qa-test-engineer",
        description:
          "Sample open role for HireMatch functional testing. Build and verify recruitment workflows including public apply links and candidate imports.",
        requirements: "2+ years QA experience, API testing, attention to detail.",
        location: "Remote",
        employmentType: "FULL_TIME",
        status: "OPEN",
        isRemote: true,
        skillsRequired: ["Testing", "API", "Automation"],
        companyId: company.id,
        postedById: hrUser.id,
        publishedAt: new Date(),
      },
    });
    console.log("Created open job:", job.title);
  } else {
    console.log("Using existing open job:", job.title);
  }

  console.log("\n✅ Test data ready");
  console.log("   Company slug:", company.slug);
  console.log("   Job slug:", job.slug);
  console.log(
    "   Public URL: http://localhost:3001/jobs/" +
      company.slug +
      "/" +
      job.slug,
  );
}

main()
  .catch((error) => {
    console.error("❌", error.message ?? error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
