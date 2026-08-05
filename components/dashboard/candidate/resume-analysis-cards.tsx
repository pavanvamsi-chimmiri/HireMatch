"use client";

import {
  AlertTriangle,
  Award,
  BadgeCheck,
  Brain,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ResumeAnalysisView } from "@/types/resume-analysis";

type ResumeAnalysisCardsProps = {
  analysis: ResumeAnalysisView | null;
  resumeStatus: string;
};

function ScoreCard({
  title,
  score,
  description,
  gradient,
  icon: Icon,
}: {
  title: string;
  score: number | null;
  description: string;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const value = score ?? 0;

  return (
    <Card className={`overflow-hidden border-0 bg-gradient-to-br ${gradient}`}>
      <CardContent className="relative p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              {score !== null ? Math.round(score) : "—"}
            </p>
            <p className="mt-2 text-sm text-white/80">{description}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <Icon className="size-6" />
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <Progress value={value} className="h-2 bg-white/20" />
          <p className="text-xs text-white/70">Out of 100</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({
  title,
  description,
  icon: Icon,
  items,
  emptyMessage,
  accentClass,
}: {
  title: string;
  description: string;
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
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item}
                className="border-border/50 flex items-start gap-3 rounded-xl border p-3 text-sm"
              >
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TagCard({
  title,
  description,
  icon: Icon,
  items,
  accentClass,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  accentClass: string;
}) {
  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${accentClass}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.length > 0 ? (
            items.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              Nothing to show yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ResumeAnalysisCards({
  analysis,
  resumeStatus,
}: ResumeAnalysisCardsProps) {
  const isAnalyzing =
    resumeStatus === "UPLOADED" ||
    resumeStatus === "PROCESSING" ||
    analysis?.status === "PENDING" ||
    analysis?.status === "PROCESSING";

  if (isAnalyzing) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Resume Analysis</CardTitle>
          <CardDescription>
            AI is scoring your resume for ATS compatibility and overall quality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Analyzing resume…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || analysis.status === "FAILED") {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Resume Analysis</CardTitle>
          <CardDescription>
            Analysis is not available yet. Try re-uploading your resume.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Resume Analysis
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          AI-powered feedback to improve your resume and ATS performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ScoreCard
          title="ATS Score"
          score={analysis.atsScore}
          description="How well your resume passes applicant tracking systems."
          gradient="from-violet-600 to-indigo-600"
          icon={Target}
        />
        <ScoreCard
          title="Resume Score"
          score={analysis.resumeScore}
          description="Overall quality, clarity, and professional impact."
          gradient="from-emerald-500 to-teal-600"
          icon={TrendingUp}
        />
      </div>

      <Card className="border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-600/10 p-2.5 text-violet-600 dark:text-violet-300">
              <Sparkles className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Professional Summary</CardTitle>
              <CardDescription>
                AI-generated overview of your profile.
              </CardDescription>
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <p className="text-sm leading-7">
            {analysis.professionalSummary ??
              "No professional summary generated."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightCard
          title="Strengths"
          description="What your resume does well."
          icon={BadgeCheck}
          items={analysis.strengths}
          emptyMessage="No strengths identified yet."
          accentClass="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        />
        <InsightCard
          title="Weaknesses"
          description="Areas that may reduce interview chances."
          icon={AlertTriangle}
          items={analysis.weaknesses}
          emptyMessage="No major weaknesses detected."
          accentClass="bg-amber-500/10 text-amber-700 dark:text-amber-300"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TagCard
          title="Missing Skills"
          description="Skills commonly expected for your profile."
          icon={Wrench}
          items={analysis.missingSkills}
          accentClass="bg-red-500/10 text-red-700 dark:text-red-300"
        />
        <TagCard
          title="Suggested Skills"
          description="Skills worth adding to strengthen your resume."
          icon={Lightbulb}
          items={analysis.suggestedSkills}
          accentClass="bg-sky-500/10 text-sky-700 dark:text-sky-300"
        />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-700 dark:text-orange-300">
              <Award className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                Recommended Certifications
              </CardTitle>
              <CardDescription>
                Credentials that could boost credibility.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.recommendedCertifications.length > 0 ? (
              analysis.recommendedCertifications.map((cert) => (
                <Badge
                  key={cert}
                  variant="outline"
                  className="border-orange-500/20 bg-orange-500/5"
                >
                  {cert}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No certification recommendations right now.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-700 dark:text-indigo-300">
              <Brain className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Recommended Projects</CardTitle>
              <CardDescription>
                Portfolio ideas to demonstrate missing experience.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {analysis.recommendedProjects.length > 0 ? (
            analysis.recommendedProjects.map((project) => (
              <div
                key={project.name}
                className="rounded-xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-4"
              >
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {project.description}
                </p>
                {project.rationale && (
                  <p className="mt-3 text-sm italic">{project.rationale}</p>
                )}
                {project.technologies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No project recommendations right now.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
