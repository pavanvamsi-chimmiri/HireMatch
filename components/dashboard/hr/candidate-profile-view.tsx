import type { ComponentType } from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { ResumePreview } from "@/components/dashboard/candidate/resume-preview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { HRCandidateProfileView } from "@/types/hr-candidate-profile";

type HRCandidateProfileViewProps = {
  profile: HRCandidateProfileView;
};

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function ScoreTile({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number | null;
  gradient: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg`}
    >
      <p className="text-sm text-white/80">{label}</p>
      <p className="mt-2 text-4xl font-bold tabular-nums">
        {value !== null ? `${Math.round(value)}%` : "—"}
      </p>
      {value !== null && (
        <Progress value={value} className="mt-4 h-2 bg-white/20" />
      )}
    </div>
  );
}

function ExternalLinkButton({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Button asChild variant="outline" className="rounded-xl">
      <a href={href} target="_blank" rel="noreferrer noopener">
        <Icon className="mr-2 size-4" />
        {label}
        <ExternalLink className="ml-2 size-3.5 opacity-60" />
      </a>
    </Button>
  );
}

export function HRCandidateProfileView({
  profile,
}: HRCandidateProfileViewProps) {
  const { candidate, parsedData, resume, analysis, ranking } = profile;
  const displayName = candidate.name ?? candidate.email;
  const skills = [
    ...new Set([
      ...candidate.profileSkills,
      ...(parsedData?.skills ?? []),
      ...(parsedData?.technologies ?? []),
    ]),
  ];
  const experience = parsedData?.experience ?? [];
  const education = parsedData?.education ?? [];
  const projects = parsedData?.projects ?? [];
  const atsScore = analysis?.atsScore ?? ranking?.factors?.atsMatch ?? null;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border bg-gradient-to-br from-blue-600/10 via-cyan-600/5 to-transparent p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar className="size-20 border-4 border-white shadow-lg">
              <AvatarImage src={candidate.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-xl text-white">
                {getInitials(candidate.name, candidate.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {displayName}
              </h1>
              <p className="text-muted-foreground mt-1">{candidate.email}</p>
              {candidate.headline && (
                <p className="mt-2 text-lg font-medium">{candidate.headline}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {candidate.location && (
                  <Badge variant="secondary">
                    <MapPin className="mr-1 size-3" />
                    {candidate.location}
                  </Badge>
                )}
                {candidate.experienceYears != null && (
                  <Badge variant="secondary">
                    <Briefcase className="mr-1 size-3" />
                    {candidate.experienceYears}+ years
                  </Badge>
                )}
                {ranking && (
                  <Badge className="bg-blue-600/10 text-blue-700 dark:text-blue-300">
                    Rank #{ranking.rank} · {ranking.job.title}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {resume && (
              <Button
                asChild
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
              >
                <a href={`/api/resumes/${resume.id}/download`}>
                  <Download className="mr-2 size-4" />
                  Download Resume
                </a>
              </Button>
            )}
            {ranking && (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={`/dashboard/hr/jobs/${ranking.job.id}`}>
                  View Job Match
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ScoreTile
          label="Match Percentage"
          value={profile.matchPercentage}
          gradient="from-blue-600 to-cyan-600"
        />
        <ScoreTile
          label="ATS Score"
          value={atsScore}
          gradient="from-indigo-600 to-violet-600"
        />
        <ScoreTile
          label="Experience Match"
          value={
            ranking?.factors?.experienceMatch ??
            analysis?.experienceScore ??
            null
          }
          gradient="from-emerald-600 to-teal-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-indigo-600 dark:text-indigo-300" />
              AI Summary
            </CardTitle>
            <CardDescription>
              AI-generated assessment for this candidate
              {ranking ? ` on ${ranking.job.title}` : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5">
              <p className="text-sm leading-7">
                {profile.aiSummary ??
                  "No AI summary available yet. Run candidate matching or resume analysis to generate insights."}
              </p>
            </div>
            {ranking?.factors && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <p className="text-muted-foreground text-xs uppercase">
                    Skill Match
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {ranking.factors.skillMatch}%
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-muted-foreground text-xs uppercase">
                    Semantic Match
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {ranking.factors.semanticSimilarity}%
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5 text-blue-600 dark:text-cyan-400" />
              Portfolio & Links
            </CardTitle>
            <CardDescription>
              Professional profiles and portfolio links.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {candidate.portfolioUrl ? (
              <ExternalLinkButton
                href={candidate.portfolioUrl}
                label="Portfolio"
                icon={Globe}
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                No portfolio URL provided.
              </p>
            )}
            {candidate.githubUrl && (
              <ExternalLinkButton
                href={candidate.githubUrl}
                label="GitHub"
                icon={Github}
              />
            )}
            {candidate.linkedinUrl && (
              <ExternalLinkButton
                href={candidate.linkedinUrl}
                label="LinkedIn"
                icon={Linkedin}
              />
            )}
            {!candidate.githubUrl && !candidate.linkedinUrl && (
              <p className="text-muted-foreground text-sm">
                GitHub and LinkedIn links not provided.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {resume && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-blue-600 dark:text-cyan-400" />
            <h2 className="text-xl font-semibold">Resume</h2>
          </div>
          <ResumePreview
            resumeId={resume.id}
            fileName={resume.fileName}
            mimeType={resume.mimeType}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-5 text-blue-600 dark:text-cyan-400" />
              Experience
            </CardTitle>
            <CardDescription>
              Work history extracted from resume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {experience.length > 0 ? (
              <div className="space-y-4">
                {experience.map((entry, index) => (
                  <div
                    key={`${entry.title}-${entry.company}-${index}`}
                    className="rounded-2xl border p-4 transition-colors hover:border-blue-500/30"
                  >
                    <p className="font-semibold">{entry.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {entry.company}
                      {entry.startDate || entry.endDate
                        ? ` · ${entry.startDate ?? "?"} – ${entry.endDate ?? "Present"}`
                        : ""}
                    </p>
                    {entry.description && (
                      <p className="text-muted-foreground mt-3 text-sm leading-6">
                        {entry.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No experience data extracted yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5 text-indigo-600 dark:text-indigo-300" />
              Education
            </CardTitle>
            <CardDescription>Academic background and degrees.</CardDescription>
          </CardHeader>
          <CardContent>
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((entry, index) => (
                  <div
                    key={`${entry.institution}-${index}`}
                    className="rounded-2xl border p-4"
                  >
                    <p className="font-semibold">{entry.institution}</p>
                    <p className="text-muted-foreground text-sm">
                      {[entry.degree, entry.field].filter(Boolean).join(" · ")}
                      {entry.startDate || entry.endDate
                        ? ` · ${entry.startDate ?? "?"} – ${entry.endDate ?? "Present"}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No education data extracted yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-emerald-600 dark:text-emerald-300" />
              Skills
            </CardTitle>
            <CardDescription>
              Skills from profile and parsed resume data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No skills listed yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-violet-600 dark:text-violet-300" />
              Projects
            </CardTitle>
            <CardDescription>
              Portfolio projects and technical work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div
                    key={`${project.name}-${index}`}
                    className="rounded-2xl border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{project.name}</p>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-blue-600 hover:underline dark:text-cyan-400"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-muted-foreground mt-2 text-sm leading-6">
                        {project.description}
                      </p>
                    )}
                    {project.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No projects extracted from resume yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {(parsedData?.certifications.length ?? 0) > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-amber-600" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {parsedData?.certifications.map((cert) => (
                <Badge key={cert} variant="secondary">
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.applications.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Applications to Your Jobs</CardTitle>
            <CardDescription>
              Other roles this candidate has applied for in your pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {profile.applications.map((application) => (
              <Link
                key={application.id}
                href={`/dashboard/hr/candidates/${candidate.id}?jobId=${application.job.id}`}
                className="rounded-2xl border p-4 transition-all hover:border-blue-500/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{application.job.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {application.job.company.name}
                    </p>
                  </div>
                  {application.aiScore !== null && (
                    <Badge className="bg-blue-600/10 text-blue-700 dark:text-blue-300">
                      {Math.round(application.aiScore)}%
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
