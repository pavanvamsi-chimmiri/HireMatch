"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  applyToPublicJobAction,
  type ApplyJobActionState,
} from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: ApplyJobActionState = {};

type PublicApplyFormProps = {
  jobId: string;
  jobTitle: string;
  isLoggedInCandidate: boolean;
};

export function PublicApplyForm({
  jobId,
  jobTitle,
  isLoggedInCandidate,
}: PublicApplyFormProps) {
  const [state, formAction, pending] = useActionState(
    applyToPublicJobAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          Application submitted
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Thank you for applying to {jobTitle}. The hiring team will review your
          application.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/login">Sign in to track your application</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4"
      encType="multipart/form-data"
    >
      <input type="hidden" name="jobId" value={jobId} />

      {state.error && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      {isLoggedInCandidate ? (
        <p className="text-muted-foreground text-sm">
          You are signed in. Submitting will use your existing candidate profile
          and primary resume.
        </p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone (optional)
            </label>
            <Input id="phone" name="phone" type="tel" />
          </div>
          <div className="space-y-2">
            <label htmlFor="resume" className="text-sm font-medium">
              Resume
            </label>
            <Input
              id="resume"
              name="resume"
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <label htmlFor="coverLetter" className="text-sm font-medium">
          Cover Letter (optional)
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={4}
          className="border-input bg-background w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Tell us why you are a great fit..."
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className={cn(
          "w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white sm:w-auto",
          pending && "opacity-80",
        )}
      >
        {pending ? "Submitting..." : "Apply Now"}
      </Button>
    </form>
  );
}
