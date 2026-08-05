"use client";

import { useActionState } from "react";
import { createJobAction, type JobActionState } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: JobActionState = {};

const textareaClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

type CompanyOption = {
  id: string;
  name: string;
};

type CreateJobFormProps = {
  companies: CompanyOption[];
};

export function CreateJobForm({ companies }: CreateJobFormProps) {
  const [state, formAction, pending] = useActionState(
    createJobAction,
    initialState,
  );

  if (companies.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="text-muted-foreground py-12 text-center text-sm">
          Link your HR profile to a company in Settings before creating jobs.
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Core details candidates will see on the job listing.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="title" className="text-sm font-medium">
              Job Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Senior Full-Stack Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="companyId" className="text-sm font-medium">
              Company
            </label>
            <select
              id="companyId"
              name="companyId"
              required
              defaultValue={companies[0]?.id}
              className="border-input bg-background h-10 w-full rounded-xl border px-3 text-sm"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Input
              id="location"
              name="location"
              placeholder="San Francisco, CA or Remote"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="experienceRequired" className="text-sm font-medium">
              Experience
            </label>
            <Input
              id="experienceRequired"
              name="experienceRequired"
              placeholder="5+ years in full-stack development"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="salary" className="text-sm font-medium">
              Salary
            </label>
            <Input
              id="salary"
              name="salary"
              placeholder="$120,000 - $150,000"
            />
            <p className="text-muted-foreground text-xs">
              Enter a single amount or a range.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="employmentType" className="text-sm font-medium">
              Employment Type
            </label>
            <select
              id="employmentType"
              name="employmentType"
              className="border-input bg-background h-10 w-full rounded-xl border px-3 text-sm"
              defaultValue="FULL_TIME"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="skillsRequired" className="text-sm font-medium">
              Required Skills
            </label>
            <Input
              id="skillsRequired"
              name="skillsRequired"
              placeholder="TypeScript, React, Node.js, PostgreSQL"
            />
            <p className="text-muted-foreground text-xs">
              Separate skills with commas.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Describe responsibilities, qualifications, and the full job posting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="responsibilities" className="text-sm font-medium">
              Responsibilities
            </label>
            <textarea
              id="responsibilities"
              name="responsibilities"
              rows={5}
              placeholder="List key responsibilities for this role..."
              className={textareaClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="qualifications" className="text-sm font-medium">
              Qualifications
            </label>
            <textarea
              id="qualifications"
              name="qualifications"
              rows={5}
              placeholder="Education, certifications, and must-have qualifications..."
              className={textareaClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Complete Job Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={8}
              required
              placeholder="Write the full job description including team context, impact, and expectations..."
              className={textareaClassName}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>
            Choose whether to publish immediately or save as a draft.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="border-input bg-background h-10 w-full min-w-[220px] rounded-xl border px-3 text-sm"
              defaultValue="OPEN"
            >
              <option value="OPEN">Publish immediately</option>
              <option value="DRAFT">Save as draft</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
          >
            {pending ? "Creating..." : "Create Job"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
