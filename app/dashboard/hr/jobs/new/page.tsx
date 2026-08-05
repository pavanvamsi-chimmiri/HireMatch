import { requireRole } from "@/lib/auth";
import { CreateJobForm } from "@/components/dashboard/hr/create-job-form";

export const dynamic = "force-dynamic";

export default async function CreateJobPage() {
  await requireRole("HR");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Job</h1>
        <p className="text-muted-foreground mt-2">
          Publish a new role and let AI match candidates to your requirements.
        </p>
      </div>

      <CreateJobForm />
    </div>
  );
}
