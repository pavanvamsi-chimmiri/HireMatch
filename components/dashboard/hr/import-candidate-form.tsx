"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  importCandidateAction,
  type CandidateImportActionState,
} from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: CandidateImportActionState = {};

type JobOption = {
  id: string;
  title: string;
  companyName: string;
  status: string;
};

type ImportCandidateFormProps = {
  jobs: JobOption[];
};

export function ImportCandidateForm({ jobs }: ImportCandidateFormProps) {
  const [state, formAction, pending] = useActionState(
    importCandidateAction,
    initialState,
  );

  const openJobs = jobs.filter((job) => job.status === "OPEN");

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      {state.error && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          Candidate imported successfully.{" "}
          <Link href="/dashboard/hr/applicants" className="underline">
            View applicants
          </Link>
        </div>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Candidate Details</CardTitle>
          <CardDescription>
            Import a candidate from LinkedIn, Naukri, or another source. Paste
            their profile URL and upload their resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="jobId" className="text-sm font-medium">
              Job
            </label>
            <select
              id="jobId"
              name="jobId"
              required
              defaultValue=""
              className="border-input bg-background w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select an open job
              </option>
              {openJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} — {job.companyName}
                </option>
              ))}
            </select>
            {openJobs.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No open jobs found.{" "}
                <Link href="/dashboard/hr/jobs/new" className="underline">
                  Create a job
                </Link>{" "}
                first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Candidate name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="candidate@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <Input id="phone" name="phone" type="tel" placeholder="+91..." />
          </div>

          <div className="space-y-2">
            <label htmlFor="profileUrl" className="text-sm font-medium">
              LinkedIn / Naukri Profile URL
            </label>
            <Input
              id="profileUrl"
              name="profileUrl"
              type="url"
              placeholder="https://linkedin.com/in/... or https://naukri.com/..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="resume" className="text-sm font-medium">
              Resume (PDF, DOC, DOCX)
            </label>
            <Input
              id="resume"
              name="resume"
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="border-input bg-background w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Where you found this candidate, interview notes, etc."
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={pending || openJobs.length === 0}
        className={cn(
          "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
          pending && "opacity-80",
        )}
      >
        {pending ? "Importing..." : "Import Candidate"}
      </Button>
    </form>
  );
}
