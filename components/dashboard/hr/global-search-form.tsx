"use client";

import type { ComponentType } from "react";
import {
  Briefcase,
  GraduationCap,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type GlobalSearchFormProps = {
  initialQuery?: string;
};

export function GlobalSearchForm({ initialQuery = "" }: GlobalSearchFormProps) {
  return (
    <form
      method="get"
      className="bg-card space-y-4 rounded-2xl border p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-blue-600 dark:text-cyan-400" />
        <h3 className="font-medium">Semantic Candidate Search</h3>
      </div>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          name="q"
          defaultValue={initialQuery}
          placeholder="Search by role, skills, experience, education, projects, or location..."
          className="rounded-xl pl-10"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Uses vector embeddings plus skills, experience, education, projects,
          location, and ATS scoring — not keyword search only.
        </p>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white"
        >
          Search Candidates
        </button>
      </div>
    </form>
  );
}

export function GlobalSearchLoadingState() {
  return (
    <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
      <Loader2 className="size-4 animate-spin" />
      Running semantic vector search...
    </div>
  );
}

export function SearchScoreBar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1">
          <Icon className="size-3" />
          {label}
        </span>
        <span className="font-medium tabular-nums">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

export function SearchScoreBadge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <span className="bg-background rounded-full border px-2.5 py-1 text-xs tabular-nums">
      {label} {value}%
    </span>
  );
}

export const searchDimensionIcons = {
  semantic: Sparkles,
  skills: Target,
  experience: Briefcase,
  education: GraduationCap,
  projects: Briefcase,
  location: MapPin,
};
