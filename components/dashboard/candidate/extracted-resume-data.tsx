"use client";

import {
  Award,
  Briefcase,
  Code2,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParsedResumeData } from "@/types/resume";

type ExtractedResumeDataProps = {
  status: string;
  parsedData: ParsedResumeData | null;
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="text-muted-foreground size-4" />
        {title}
      </div>
      {children}
    </div>
  );
}

export function ExtractedResumeData({
  status,
  parsedData,
}: ExtractedResumeDataProps) {
  if (status === "PROCESSING" || status === "UPLOADED") {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Extracted Profile Data</CardTitle>
          <CardDescription>
            AI is reading your resume and extracting contact details, skills,
            and experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Parsing resume…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "FAILED") {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Extracted Profile Data</CardTitle>
          <CardDescription>
            We could not automatically parse this resume. You can re-upload or
            update your profile manually.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!parsedData) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Extracted Profile Data</CardTitle>
        <CardDescription>
          Information extracted from your resume and saved to your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-xs uppercase">
              <User className="size-3.5" />
              Name
            </div>
            <p className="text-sm">{parsedData.name ?? "Not found"}</p>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-xs uppercase">
              <Mail className="size-3.5" />
              Email
            </div>
            <p className="text-sm">{parsedData.email ?? "Not found"}</p>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-xs uppercase">
              <Phone className="size-3.5" />
              Phone
            </div>
            <p className="text-sm">{parsedData.phone ?? "Not found"}</p>
          </div>
        </div>

        {(parsedData.skills.length > 0 ||
          parsedData.technologies.length > 0) && (
          <Section title="Skills & Technologies" icon={Code2}>
            <div className="flex flex-wrap gap-2">
              {[...parsedData.skills, ...parsedData.technologies].map(
                (item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ),
              )}
            </div>
          </Section>
        )}

        {parsedData.experience.length > 0 && (
          <Section title="Experience" icon={Briefcase}>
            <div className="space-y-3">
              {parsedData.experience.map((entry, index) => (
                <div
                  key={`${entry.title}-${entry.company}-${index}`}
                  className="rounded-lg border p-3"
                >
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {entry.company}
                    {entry.startDate || entry.endDate
                      ? ` · ${entry.startDate ?? "?"} – ${entry.endDate ?? "Present"}`
                      : ""}
                  </p>
                  {entry.description && (
                    <p className="text-muted-foreground mt-2 text-sm">
                      {entry.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {parsedData.education.length > 0 && (
          <Section title="Education" icon={GraduationCap}>
            <div className="space-y-3">
              {parsedData.education.map((entry, index) => (
                <div
                  key={`${entry.institution}-${index}`}
                  className="rounded-lg border p-3"
                >
                  <p className="font-medium">{entry.institution}</p>
                  <p className="text-muted-foreground text-sm">
                    {[entry.degree, entry.field].filter(Boolean).join(" · ")}
                    {entry.startDate || entry.endDate
                      ? ` · ${entry.startDate ?? "?"} – ${entry.endDate ?? "Present"}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {parsedData.projects.length > 0 && (
          <Section title="Projects" icon={Code2}>
            <div className="space-y-3">
              {parsedData.projects.map((project, index) => (
                <div
                  key={`${project.name}-${index}`}
                  className="rounded-lg border p-3"
                >
                  <p className="font-medium">{project.name}</p>
                  {project.description && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {project.description}
                    </p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
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
          </Section>
        )}

        {parsedData.certifications.length > 0 && (
          <Section title="Certifications" icon={Award}>
            <div className="flex flex-wrap gap-2">
              {parsedData.certifications.map((cert) => (
                <Badge key={cert} variant="secondary">
                  {cert}
                </Badge>
              ))}
            </div>
          </Section>
        )}
      </CardContent>
    </Card>
  );
}
