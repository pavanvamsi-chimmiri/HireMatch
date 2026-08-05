import {
  PrismaClient,
  UserRole,
  JobStatus,
  EmploymentType,
  ApplicationStatus,
  ResumeStatus,
  AnalysisStatus,
  NotificationType,
  EmailStatus,
  EmailType,
  SettingScope,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HireMatch AI database...\n");

  // ─── Clean existing seed data (dev only) ───────────────────────────────────
  await prisma.candidateRanking.deleteMany();
  await prisma.resumeAnalysis.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.email.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.application.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.job.deleteMany();
  await prisma.hRProfile.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // ─── Company ───────────────────────────────────────────────────────────────
  const company = await prisma.company.create({
    data: {
      id: "seed_company_hirematch",
      name: "HireMatch Labs",
      slug: "hirematch-labs",
      description:
        "AI-powered recruitment platform helping companies find top talent faster.",
      website: "https://hirematch.ai",
      industry: "Technology",
      size: "51-200",
      location: "San Francisco, CA",
    },
  });

  // ─── Users ─────────────────────────────────────────────────────────────────
  const hrUser = await prisma.user.create({
    data: {
      id: "seed_user_hr_sarah",
      supabaseId: "seed_supabase_hr_sarah",
      email: "sarah.chen@hirematch.ai",
      name: "Sarah Chen",
      role: UserRole.HR,
      phone: "+1 (415) 555-0101",
      bio: "Head of Talent Acquisition with 10+ years in tech recruiting.",
      profileCompleted: true,
      isActive: true,
    },
  });

  const candidateOne = await prisma.user.create({
    data: {
      id: "seed_user_candidate_alex",
      supabaseId: "seed_supabase_candidate_alex",
      email: "alex.johnson@email.com",
      name: "Alex Johnson",
      role: UserRole.CANDIDATE,
      phone: "+1 (212) 555-0202",
      bio: "Full-stack developer passionate about AI and scalable systems.",
      profileCompleted: true,
      isActive: true,
    },
  });

  const candidateTwo = await prisma.user.create({
    data: {
      id: "seed_user_candidate_maria",
      supabaseId: "seed_supabase_candidate_maria",
      email: "maria.garcia@email.com",
      name: "Maria Garcia",
      role: UserRole.CANDIDATE,
      phone: "+1 (305) 555-0303",
      bio: "Senior product designer with a focus on user-centered design.",
      profileCompleted: true,
      isActive: true,
    },
  });

  const candidateThree = await prisma.user.create({
    data: {
      id: "seed_user_candidate_james",
      supabaseId: "seed_supabase_candidate_james",
      email: "james.wilson@email.com",
      name: "James Wilson",
      role: UserRole.CANDIDATE,
      phone: "+1 (512) 555-0404",
      bio: "DevOps engineer specializing in cloud infrastructure and CI/CD.",
      profileCompleted: true,
      isActive: true,
    },
  });

  // ─── HR Profile ────────────────────────────────────────────────────────────
  await prisma.hRProfile.create({
    data: {
      id: "seed_hr_profile_sarah",
      userId: hrUser.id,
      companyId: company.id,
      jobTitle: "Head of Talent Acquisition",
      department: "Human Resources",
      linkedinUrl: "https://linkedin.com/in/sarahchen",
      hiringFocus: "Engineering and Product roles",
    },
  });

  // ─── Candidate Profiles ────────────────────────────────────────────────────
  await prisma.candidateProfile.create({
    data: {
      id: "seed_candidate_profile_alex",
      userId: candidateOne.id,
      headline: "Senior Full-Stack Developer",
      summary:
        "5+ years building web applications with React, Node.js, and PostgreSQL.",
      location: "New York, NY",
      experienceYears: 5,
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
      education: {
        degree: "B.S. Computer Science",
        school: "NYU",
        year: 2019,
      },
      certifications: ["AWS Solutions Architect"],
      linkedinUrl: "https://linkedin.com/in/alexjohnson",
      githubUrl: "https://github.com/alexjohnson",
      desiredSalaryMin: 120000,
      desiredSalaryMax: 160000,
      preferredJobType: EmploymentType.FULL_TIME,
      openToRemote: true,
    },
  });

  await prisma.candidateProfile.create({
    data: {
      id: "seed_candidate_profile_maria",
      userId: candidateTwo.id,
      headline: "Senior Product Designer",
      summary:
        "7 years designing intuitive digital products for SaaS and fintech companies.",
      location: "Miami, FL",
      experienceYears: 7,
      skills: [
        "Figma",
        "UI/UX",
        "Design Systems",
        "User Research",
        "Prototyping",
      ],
      education: {
        degree: "B.F.A. Graphic Design",
        school: "RISD",
        year: 2017,
      },
      portfolioUrl: "https://mariagarcia.design",
      desiredSalaryMin: 100000,
      desiredSalaryMax: 140000,
      preferredJobType: EmploymentType.FULL_TIME,
      openToRemote: true,
    },
  });

  await prisma.candidateProfile.create({
    data: {
      id: "seed_candidate_profile_james",
      userId: candidateThree.id,
      headline: "DevOps Engineer",
      summary:
        "4 years managing cloud infrastructure on AWS and GCP with Kubernetes.",
      location: "Austin, TX",
      experienceYears: 4,
      skills: ["Kubernetes", "Terraform", "AWS", "GCP", "CI/CD", "Python"],
      certifications: ["CKA", "AWS DevOps Engineer"],
      githubUrl: "https://github.com/jameswilson",
      desiredSalaryMin: 110000,
      desiredSalaryMax: 150000,
      preferredJobType: EmploymentType.REMOTE,
      openToRemote: true,
      openToRelocate: false,
    },
  });

  // ─── Jobs ──────────────────────────────────────────────────────────────────
  const seniorEngineerJob = await prisma.job.create({
    data: {
      id: "seed_job_senior_engineer",
      title: "Senior Full-Stack Engineer",
      slug: "senior-full-stack-engineer",
      description:
        "Join our engineering team to build the next generation of AI-powered recruitment tools.",
      requirements:
        "5+ years experience with TypeScript, React, and Node.js. Experience with PostgreSQL and cloud platforms.",
      responsibilities:
        "Design and implement new features, mentor junior developers, participate in code reviews.",
      location: "San Francisco, CA (Hybrid)",
      employmentType: EmploymentType.FULL_TIME,
      salaryMin: 130000,
      salaryMax: 170000,
      status: JobStatus.OPEN,
      isRemote: true,
      skillsRequired: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
      benefits: [
        "Health Insurance",
        "401k",
        "Unlimited PTO",
        "Remote Flexibility",
      ],
      aiMatchThreshold: 75,
      publishedAt: new Date(),
      companyId: company.id,
      postedById: hrUser.id,
    },
  });

  const productDesignerJob = await prisma.job.create({
    data: {
      id: "seed_job_product_designer",
      title: "Senior Product Designer",
      slug: "senior-product-designer",
      description:
        "Lead design for our candidate matching and dashboard experiences.",
      requirements:
        "5+ years in product design. Strong portfolio demonstrating UX process and design systems.",
      location: "Remote",
      employmentType: EmploymentType.REMOTE,
      salaryMin: 110000,
      salaryMax: 145000,
      status: JobStatus.OPEN,
      isRemote: true,
      skillsRequired: ["Figma", "UI/UX", "Design Systems", "User Research"],
      benefits: ["Health Insurance", "401k", "Home Office Stipend"],
      aiMatchThreshold: 70,
      publishedAt: new Date(),
      companyId: company.id,
      postedById: hrUser.id,
    },
  });

  const devOpsJob = await prisma.job.create({
    data: {
      id: "seed_job_devops",
      title: "DevOps Engineer",
      slug: "devops-engineer",
      description:
        "Build and maintain our cloud infrastructure supporting AI workloads at scale.",
      requirements:
        "3+ years with Kubernetes, Terraform, and AWS. Experience with CI/CD pipelines.",
      location: "Austin, TX",
      employmentType: EmploymentType.FULL_TIME,
      salaryMin: 115000,
      salaryMax: 155000,
      status: JobStatus.OPEN,
      isRemote: true,
      skillsRequired: ["Kubernetes", "Terraform", "AWS", "CI/CD"],
      benefits: ["Health Insurance", "401k", "Learning Budget"],
      aiMatchThreshold: 72,
      publishedAt: new Date(),
      companyId: company.id,
      postedById: hrUser.id,
    },
  });

  // ─── Resumes ───────────────────────────────────────────────────────────────
  const alexResume = await prisma.resume.create({
    data: {
      id: "seed_resume_alex",
      candidateId: candidateOne.id,
      fileName: "alex_johnson_resume.pdf",
      fileUrl: "https://storage.hirematch.ai/resumes/alex_johnson_resume.pdf",
      fileSize: 245760,
      mimeType: "application/pdf",
      status: ResumeStatus.PARSED,
      isPrimary: true,
      parsedText:
        "Alex Johnson - Senior Full-Stack Developer with 5 years experience in TypeScript, React, Node.js...",
      parsedData: {
        name: "Alex Johnson",
        email: "alex.johnson@email.com",
        skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
        experience: [
          { title: "Senior Developer", company: "TechCorp", years: 3 },
        ],
      },
      parsedAt: new Date(),
    },
  });

  const mariaResume = await prisma.resume.create({
    data: {
      id: "seed_resume_maria",
      candidateId: candidateTwo.id,
      fileName: "maria_garcia_resume.pdf",
      fileUrl: "https://storage.hirematch.ai/resumes/maria_garcia_resume.pdf",
      fileSize: 198432,
      mimeType: "application/pdf",
      status: ResumeStatus.PARSED,
      isPrimary: true,
      parsedText:
        "Maria Garcia - Senior Product Designer with 7 years in SaaS and fintech...",
      parsedAt: new Date(),
    },
  });

  const jamesResume = await prisma.resume.create({
    data: {
      id: "seed_resume_james",
      candidateId: candidateThree.id,
      fileName: "james_wilson_resume.pdf",
      fileUrl: "https://storage.hirematch.ai/resumes/james_wilson_resume.pdf",
      fileSize: 210944,
      mimeType: "application/pdf",
      status: ResumeStatus.PARSED,
      isPrimary: true,
      parsedText:
        "James Wilson - DevOps Engineer with 4 years in Kubernetes and AWS...",
      parsedAt: new Date(),
    },
  });

  // ─── Applications ──────────────────────────────────────────────────────────
  const alexApplication = await prisma.application.create({
    data: {
      id: "seed_application_alex_engineer",
      jobId: seniorEngineerJob.id,
      candidateId: candidateOne.id,
      resumeId: alexResume.id,
      coverLetter:
        "I am excited to apply for the Senior Full-Stack Engineer role. My experience with TypeScript and React aligns perfectly with your requirements.",
      status: ApplicationStatus.REVIEWING,
      aiScore: 92.5,
      aiSummary:
        "Strong match — 5 years full-stack experience with all required technologies.",
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const mariaApplication = await prisma.application.create({
    data: {
      id: "seed_application_maria_designer",
      jobId: productDesignerJob.id,
      candidateId: candidateTwo.id,
      resumeId: mariaResume.id,
      coverLetter:
        "As a senior product designer with extensive SaaS experience, I would love to shape the candidate experience at HireMatch.",
      status: ApplicationStatus.SHORTLISTED,
      aiScore: 88.0,
      aiSummary:
        "Excellent design portfolio with strong UX research background.",
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shortlistedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const jamesApplication = await prisma.application.create({
    data: {
      id: "seed_application_james_devops",
      jobId: devOpsJob.id,
      candidateId: candidateThree.id,
      resumeId: jamesResume.id,
      status: ApplicationStatus.PENDING,
      aiScore: 85.5,
      aiSummary:
        "Good DevOps background with Kubernetes and AWS certifications.",
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // ─── Resume Analyses ───────────────────────────────────────────────────────
  await prisma.resumeAnalysis.create({
    data: {
      id: "seed_analysis_alex",
      resumeId: alexResume.id,
      applicationId: alexApplication.id,
      jobId: seniorEngineerJob.id,
      status: AnalysisStatus.COMPLETED,
      overallScore: 92.5,
      skillsScore: 95.0,
      experienceScore: 90.0,
      educationScore: 88.0,
      cultureFitScore: 85.0,
      summary:
        "Alex is an excellent match for the Senior Full-Stack Engineer role with strong TypeScript and React expertise.",
      strengths: [
        "5 years full-stack experience",
        "All required skills present",
        "AWS certification",
      ],
      gaps: ["No GraphQL experience mentioned"],
      recommendations: [
        "Schedule technical interview",
        "Assess system design skills",
      ],
      keywordMatches: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
      model: "gpt-4o-mini",
      tokensUsed: 1250,
      analyzedAt: new Date(),
    },
  });

  await prisma.resumeAnalysis.create({
    data: {
      id: "seed_analysis_maria",
      resumeId: mariaResume.id,
      applicationId: mariaApplication.id,
      jobId: productDesignerJob.id,
      status: AnalysisStatus.COMPLETED,
      overallScore: 88.0,
      skillsScore: 92.0,
      experienceScore: 86.0,
      educationScore: 90.0,
      summary:
        "Maria has strong product design credentials with relevant SaaS experience.",
      strengths: [
        "7 years design experience",
        "Strong portfolio",
        "Design systems expertise",
      ],
      gaps: ["Limited B2B recruitment domain experience"],
      keywordMatches: ["Figma", "UI/UX", "Design Systems", "User Research"],
      model: "gpt-4o-mini",
      tokensUsed: 980,
      analyzedAt: new Date(),
    },
  });

  // ─── Candidate Rankings ────────────────────────────────────────────────────
  await prisma.candidateRanking.create({
    data: {
      id: "seed_ranking_alex",
      jobId: seniorEngineerJob.id,
      candidateId: candidateOne.id,
      applicationId: alexApplication.id,
      rank: 1,
      score: 92.5,
      aiSummary: "Top candidate — exceeds requirements across all skill areas.",
      factors: {
        skillsMatch: 95,
        experienceMatch: 90,
        cultureFit: 85,
      },
      isShortlisted: true,
    },
  });

  await prisma.candidateRanking.create({
    data: {
      id: "seed_ranking_maria",
      jobId: productDesignerJob.id,
      candidateId: candidateTwo.id,
      applicationId: mariaApplication.id,
      rank: 1,
      score: 88.0,
      aiSummary: "Leading candidate with exceptional design portfolio.",
      factors: {
        skillsMatch: 92,
        experienceMatch: 86,
        portfolioQuality: 94,
      },
      isShortlisted: true,
    },
  });

  await prisma.candidateRanking.create({
    data: {
      id: "seed_ranking_james",
      jobId: devOpsJob.id,
      candidateId: candidateThree.id,
      applicationId: jamesApplication.id,
      rank: 1,
      score: 85.5,
      aiSummary: "Strong DevOps candidate with relevant certifications.",
      factors: {
        skillsMatch: 88,
        experienceMatch: 82,
        certifications: 90,
      },
    },
  });

  // ─── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        id: "seed_notif_alex_app",
        userId: candidateOne.id,
        type: NotificationType.APPLICATION_UPDATE,
        title: "Application Under Review",
        message:
          "Your application for Senior Full-Stack Engineer is now being reviewed.",
        linkUrl: "/dashboard/candidate",
        isRead: false,
      },
      {
        id: "seed_notif_maria_shortlist",
        userId: candidateTwo.id,
        type: NotificationType.APPLICATION_UPDATE,
        title: "You've Been Shortlisted!",
        message:
          "Congratulations! You've been shortlisted for Senior Product Designer.",
        linkUrl: "/dashboard/candidate",
        isRead: true,
        readAt: new Date(),
      },
      {
        id: "seed_notif_hr_ranking",
        userId: hrUser.id,
        type: NotificationType.RANKING_UPDATE,
        title: "New Candidate Rankings Ready",
        message:
          "AI rankings have been updated for Senior Full-Stack Engineer with 1 top match.",
        linkUrl: "/dashboard/hr",
        isRead: false,
      },
      {
        id: "seed_notif_alex_match",
        userId: candidateOne.id,
        type: NotificationType.JOB_MATCH,
        title: "New Job Match",
        message:
          "A new role matching your skills is available: DevOps Engineer.",
        linkUrl: "/dashboard/candidate",
        isRead: false,
      },
    ],
  });

  // ─── Emails ────────────────────────────────────────────────────────────────
  await prisma.email.createMany({
    data: [
      {
        id: "seed_email_welcome_alex",
        userId: candidateOne.id,
        type: EmailType.WELCOME,
        to: "alex.johnson@email.com",
        from: "HireMatch AI <noreply@hirematch.ai>",
        subject: "Welcome to HireMatch AI!",
        htmlBody:
          "<h1>Welcome, Alex!</h1><p>Start exploring AI-matched jobs today.</p>",
        textBody: "Welcome, Alex! Start exploring AI-matched jobs today.",
        status: EmailStatus.DELIVERED,
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "seed_email_app_received",
        userId: candidateOne.id,
        type: EmailType.APPLICATION_RECEIVED,
        to: "alex.johnson@email.com",
        from: "HireMatch AI <noreply@hirematch.ai>",
        subject: "Application Received — Senior Full-Stack Engineer",
        htmlBody:
          "<p>We received your application for Senior Full-Stack Engineer.</p>",
        status: EmailStatus.SENT,
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "seed_email_shortlist_maria",
        userId: candidateTwo.id,
        type: EmailType.APPLICATION_UPDATE,
        to: "maria.garcia@email.com",
        from: "HireMatch AI <noreply@hirematch.ai>",
        subject: "You've been shortlisted!",
        htmlBody:
          "<p>Great news — you've been shortlisted for Senior Product Designer.</p>",
        status: EmailStatus.SENT,
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // ─── Settings ──────────────────────────────────────────────────────────────
  await prisma.setting.createMany({
    data: [
      {
        id: "seed_setting_system_ai_model",
        scope: SettingScope.SYSTEM,
        category: "ai",
        key: "default_model",
        value: { model: "gpt-4o-mini", maxTokens: 4096 },
      },
      {
        id: "seed_setting_system_match_threshold",
        scope: SettingScope.SYSTEM,
        category: "matching",
        key: "default_threshold",
        value: { threshold: 70, autoShortlist: 85 },
      },
      {
        id: "seed_setting_hr_notifications",
        scope: SettingScope.USER,
        userId: hrUser.id,
        category: "notifications",
        key: "email_preferences",
        value: {
          applicationReceived: true,
          rankingUpdates: true,
          weeklyDigest: true,
        },
      },
      {
        id: "seed_setting_candidate_notifications",
        scope: SettingScope.USER,
        userId: candidateOne.id,
        category: "notifications",
        key: "email_preferences",
        value: {
          jobMatches: true,
          applicationUpdates: true,
          weeklyDigest: false,
        },
      },
      {
        id: "seed_setting_hr_dashboard",
        scope: SettingScope.USER,
        userId: hrUser.id,
        category: "dashboard",
        key: "layout",
        value: { defaultView: "pipeline", showAiScores: true },
      },
    ],
  });

  console.log("✅ Seed completed successfully!\n");
  console.log("Created:");
  console.log("  • 1 company");
  console.log("  • 4 users (1 HR, 3 candidates)");
  console.log("  • 1 HR profile, 3 candidate profiles");
  console.log("  • 3 jobs");
  console.log("  • 3 resumes");
  console.log("  • 3 applications");
  console.log("  • 2 resume analyses");
  console.log("  • 3 candidate rankings");
  console.log("  • 4 notifications");
  console.log("  • 3 emails");
  console.log("  • 5 settings");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
