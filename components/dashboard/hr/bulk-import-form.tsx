"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  bulkImportCandidatesAction,
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

type BulkImportFormProps = {
  jobs: JobOption[];
};

const sampleCsv = `Name,Email,Phone,LinkedIn URL,Naukri URL,Notes
Jane Doe,jane@example.com,9876543210,https://linkedin.com/in/janedoe,,Found on LinkedIn
John Smith,john@example.com,9123456789,,https://naukri.com/mnjohn,Applied via Naukri`;

export function BulkImportForm({ jobs }: BulkImportFormProps) {
  const [state, formAction, pending] = useActionState(
    bulkImportCandidatesAction,
    initialState,
  );

  const openJobs = jobs.filter((job) => job.status === "OPEN");

  return (
    <form
      action={formAction}
      className="space-y-6"
      encType="multipart/form-data"
    >
      {state.error && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          Imported {state.importedCount ?? 0} candidate
          {(state.importedCount ?? 0) === 1 ? "" : "s"}.
          {state.skippedCount ? ` ${state.skippedCount} skipped.` : ""}{" "}
          <Link href="/dashboard/hr/applicants" className="underline">
            View applicants
          </Link>
        </div>
      )}

      {state.errors && state.errors.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <p className="font-medium">Import warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>CSV Format</CardTitle>
          <CardDescription>
            Required columns: <strong>Name</strong> and <strong>Email</strong>.
            Optional: Phone, LinkedIn URL, Naukri URL, Notes. Resumes are not
            included in CSV — import profiles first, then upload resumes from
            the candidate profile if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted overflow-x-auto rounded-xl p-4 text-xs">
            {sampleCsv}
          </pre>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
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
          </div>

          <div className="space-y-2">
            <label htmlFor="csvFile" className="text-sm font-medium">
              CSV File
            </label>
            <Input
              id="csvFile"
              name="csvFile"
              type="file"
              accept=".csv,text/csv"
              required
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
        {pending ? "Importing..." : "Import CSV"}
      </Button>
    </form>
  );
}
