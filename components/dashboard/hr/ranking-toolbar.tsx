"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RankingSortOption } from "@/types/hr-rankings";

type RankingToolbarProps = {
  jobs: { id: string; title: string }[];
  initialQuery?: string;
  initialJobId?: string;
  initialSort?: RankingSortOption;
  initialMinScore?: number;
  initialShortlisted?: boolean;
};

const sortOptions: { value: RankingSortOption; label: string }[] = [
  { value: "overall", label: "Overall Match" },
  { value: "skill", label: "Skill Match" },
  { value: "ats", label: "ATS Match" },
  { value: "experience", label: "Experience Match" },
  { value: "rank", label: "Job Rank" },
  { value: "newest", label: "Newest First" },
];

const selectClassName =
  "border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

export function RankingToolbar({
  jobs,
  initialQuery = "",
  initialJobId = "",
  initialSort = "overall",
  initialMinScore,
  initialShortlisted = false,
}: RankingToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/dashboard/hr/rankings?${params.toString()}`);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    updateParams({
      q: (formData.get("q") as string) || null,
      jobId: (formData.get("jobId") as string) || null,
      sort: (formData.get("sort") as string) || "overall",
      minScore: (formData.get("minScore") as string) || null,
      shortlisted: formData.get("shortlisted") === "on" ? "1" : null,
    });
  }

  function handleReset() {
    startTransition(() => {
      router.push("/dashboard/hr/rankings");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card space-y-4 rounded-2xl border p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="size-4 text-blue-600 dark:text-cyan-400" />
        <h3 className="font-medium">Search, Filter & Sort</h3>
        {isPending && (
          <span className="text-muted-foreground text-xs">Updating...</span>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            name="q"
            defaultValue={initialQuery}
            placeholder="Search candidate, email, or job..."
            className="rounded-xl pl-10"
          />
        </div>

        <select
          name="jobId"
          defaultValue={initialJobId}
          className={selectClassName}
        >
          <option value="">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <select
          name="sort"
          defaultValue={initialSort}
          className={selectClassName}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>

        <Input
          name="minScore"
          type="number"
          min={0}
          max={100}
          defaultValue={initialMinScore ?? ""}
          placeholder="Min score %"
          className="rounded-xl"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="shortlisted"
            defaultChecked={initialShortlisted}
            className="size-4 rounded border-gray-300"
          />
          <Filter className="text-muted-foreground size-4" />
          Shortlisted only
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
          >
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
}
