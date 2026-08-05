"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { applyToJobAction } from "@/actions/applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ApplyJobButtonProps = {
  jobId: string;
  jobTitle: string;
  hasApplied?: boolean;
  applicationStatus?: string | null;
  disabled?: boolean;
  size?: "sm" | "default";
};

export function ApplyJobButton({
  jobId,
  jobTitle,
  hasApplied = false,
  applicationStatus,
  disabled = false,
  size = "sm",
}: ApplyJobButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(hasApplied);
  const [isPending, startTransition] = useTransition();

  if (applied || hasApplied) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="mr-1 size-3.5" />
        {applicationStatus
          ? applicationStatus.charAt(0) +
            applicationStatus.slice(1).toLowerCase()
          : "Applied"}
      </Badge>
    );
  }

  function handleApply() {
    setError(null);

    startTransition(async () => {
      const result = await applyToJobAction(jobId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setApplied(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        size={size}
        disabled={disabled || isPending}
        onClick={handleApply}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Applying...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            One-Click Apply
          </>
        )}
      </Button>
      {error && (
        <p className="max-w-[220px] text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {!disabled && !error && (
        <p className="text-muted-foreground max-w-[220px] text-right text-[11px]">
          Apply instantly to {jobTitle}
        </p>
      )}
    </div>
  );
}
