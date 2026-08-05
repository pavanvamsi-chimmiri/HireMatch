"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { runCandidateMatchingAction } from "@/actions/matching";
import { Button } from "@/components/ui/button";

type RunMatchingButtonProps = {
  jobId: string;
};

export function RunMatchingButton({ jobId }: RunMatchingButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRunMatching() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await runCandidateMatchingAction(jobId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage(
        result.matchedCount
          ? `Ranked ${result.matchedCount} candidate${result.matchedCount === 1 ? "" : "s"} using AI semantic matching.`
          : "Matching completed. No parsed resumes were found.",
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        disabled={isPending}
        onClick={handleRunMatching}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Matching...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            Run AI Candidate Matching
          </>
        )}
      </Button>

      {message && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
