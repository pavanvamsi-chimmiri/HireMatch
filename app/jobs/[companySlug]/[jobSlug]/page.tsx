import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, MapPin } from "lucide-react";
import { PublicApplyForm } from "@/components/jobs/public-apply-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import {
  buildPublicJobUrl,
  getPublicJob,
  incrementJobViewCount,
} from "@/lib/jobs/public";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type PublicJobPageProps = {
  params: Promise<{ companySlug: string; jobSlug: string }>;
};

function formatEmploymentType(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
) {
  if (!min && !max) {
    return null;
  }

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "INR",
    maximumFractionDigits: 0,
  });

  if (min && max && min !== max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  return formatter.format(min ?? max ?? 0);
}

export async function generateMetadata({ params }: PublicJobPageProps) {
  const { companySlug, jobSlug } = await params;

  try {
    const job = await getPublicJob(companySlug, jobSlug);
    if (!job) {
      return { title: "Job Not Found" };
    }

    return {
      title: `${job.title} at ${job.company.name} | ${env.NEXT_PUBLIC_APP_NAME}`,
      description: job.description.slice(0, 160),
    };
  } catch {
    return { title: `Job | ${env.NEXT_PUBLIC_APP_NAME}` };
  }
}

export default async function PublicJobPage({ params }: PublicJobPageProps) {
  const { companySlug, jobSlug } = await params;

  let job;
  try {
    job = await getPublicJob(companySlug, jobSlug);
  } catch {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-6">
        <Card className="border-border/50 max-w-lg">
          <CardHeader>
            <CardTitle>Database not configured</CardTitle>
            <CardDescription>
              Copy `.env.example` to `.env`, add your Supabase DATABASE_URL, run
              migrations, then restart the dev server.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    notFound();
  }

  await incrementJobViewCount(job.id);

  const currentUser = await getCurrentUser();
  const isLoggedInCandidate = currentUser?.role === "CANDIDATE";
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border/50 border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold">
            {env.NEXT_PUBLIC_APP_NAME}
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground text-sm hover:underline"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Open Role
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground text-lg">{job.company.name}</p>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              {(job.location || job.isRemote) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {job.isRemote
                    ? job.location
                      ? `${job.location} · Remote`
                      : "Remote"
                    : job.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Briefcase className="size-4" />
                {formatEmploymentType(job.employmentType)}
              </span>
              {salary && <span>{salary}</span>}
            </div>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>About the role</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {job.description}
            </CardContent>
          </Card>

          {job.requirements && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="text-sm whitespace-pre-wrap">
                {job.requirements}
              </CardContent>
            </Card>
          )}

          {job.skillsRequired.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-border/50 lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle>Apply for this job</CardTitle>
              <CardDescription>
                Submit your application directly to {job.company.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PublicApplyForm
                jobId={job.id}
                jobTitle={job.title}
                isLoggedInCandidate={isLoggedInCandidate}
              />
            </CardContent>
          </Card>

          <p className="text-muted-foreground text-center text-xs">
            Share this page: {buildPublicJobUrl(companySlug, jobSlug)}
          </p>
        </div>
      </main>
    </div>
  );
}
