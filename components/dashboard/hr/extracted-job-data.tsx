"use client";

import {
  BookOpen,
  Briefcase,
  Code2,
  GraduationCap,
  Sparkles,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JobAnalysisView } from "@/types/job-analysis";

type ExtractedJobDataProps = {
  analysis: JobAnalysisView | null;
};

function Section({
  title,
  icon: Icon,
  items,
  emptyMessage,
  accentClass,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  emptyMessage: string;
  accentClass: string;
}) {
  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${accentClass}`}>
            <Icon className="size-5" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ExtractedJobData({ analysis }: ExtractedJobDataProps) {
  if (!analysis) {
    return (
      <Card className="border-border/50">
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          Job description analysis is not available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Extracted Job Requirements
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Structured JSON generated from the job description
          {analysis.parsedAt
            ? ` · ${new Date(analysis.parsedAt).toLocaleString()}`
            : ""}
          .
        </p>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/10 via-cyan-600/5 to-transparent px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-700 dark:text-blue-300">
              <Sparkles className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Structured JSON</CardTitle>
              <CardDescription>
                Stored parsed job data used for AI candidate matching.
              </CardDescription>
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <pre className="bg-muted/40 overflow-x-auto rounded-xl border p-4 text-xs leading-6">
            {JSON.stringify(
              {
                skills: analysis.skills,
                technologies: analysis.technologies,
                education: analysis.education,
                experience: analysis.experience,
                responsibilities: analysis.responsibilities,
                keywords: analysis.keywords,
              },
              null,
              2,
            )}
          </pre>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Section
          title="Skills"
          icon={Briefcase}
          items={analysis.skills}
          emptyMessage="No skills extracted."
          accentClass="bg-blue-500/10 text-blue-700 dark:text-blue-300"
        />
        <Section
          title="Technologies"
          icon={Code2}
          items={analysis.technologies}
          emptyMessage="No technologies extracted."
          accentClass="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
        />
        <Section
          title="Keywords"
          icon={Tag}
          items={analysis.keywords}
          emptyMessage="No keywords extracted."
          accentClass="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Education"
          icon={GraduationCap}
          items={analysis.education}
          emptyMessage="No education requirements extracted."
          accentClass="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        />

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-700 dark:text-violet-300">
                <BookOpen className="size-5" />
              </div>
              <CardTitle className="text-base">Experience</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {analysis.experience?.summary ? (
              <p>{analysis.experience.summary}</p>
            ) : (
              <p className="text-muted-foreground">
                No experience requirements extracted.
              </p>
            )}
            {analysis.experience?.minimumYears != null && (
              <p className="text-muted-foreground">
                Minimum years: {analysis.experience.minimumYears}
              </p>
            )}
            {analysis.experience?.level && (
              <Badge variant="outline">{analysis.experience.level}</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Responsibilities</CardTitle>
          <CardDescription>
            Key duties extracted from the job description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.responsibilities.length > 0 ? (
            <ul className="space-y-3">
              {analysis.responsibilities.map((item) => (
                <li
                  key={item}
                  className="border-border/50 rounded-xl border p-3 text-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No responsibilities extracted.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
