import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateJobForm } from "@/components/dashboard/hr/create-job-form";

export const dynamic = "force-dynamic";

export default async function CreateJobPage() {
  const user = await requireRole("HR");

  let companies: { id: string; name: string }[] = [];

  try {
    const hrProfile = await prisma.hRProfile.findUnique({
      where: { userId: user.id },
      include: { company: true },
    });

    if (hrProfile?.company) {
      companies = [{ id: hrProfile.company.id, name: hrProfile.company.name }];
    }
  } catch {
    companies = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Job</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the job details below. All fields are stored in your hiring
          database and used for AI candidate matching.
        </p>
      </div>

      <CreateJobForm companies={companies} />
    </div>
  );
}
