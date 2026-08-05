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

export function CreateJobForm() {
  const [state, formAction, pending] = useActionState(
    createJobAction,
    initialState,
  );

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>
          Create a new role and publish it to start receiving applicants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
              {state.error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                required
                placeholder="Describe the role, team, and impact..."
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                placeholder="Required skills and experience..."
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="responsibilities" className="text-sm font-medium">
                Responsibilities
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                rows={4}
                placeholder="Day-to-day responsibilities..."
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                name="location"
                placeholder="San Francisco, CA"
              />
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

            <div className="space-y-2">
              <label htmlFor="salaryMin" className="text-sm font-medium">
                Salary Min (USD)
              </label>
              <Input
                id="salaryMin"
                name="salaryMin"
                type="number"
                placeholder="100000"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salaryMax" className="text-sm font-medium">
                Salary Max (USD)
              </label>
              <Input
                id="salaryMax"
                name="salaryMax"
                type="number"
                placeholder="150000"
              />
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

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="isRemote"
                name="isRemote"
                type="checkbox"
                className="size-4 rounded border"
              />
              <label htmlFor="isRemote" className="text-sm font-medium">
                Remote-friendly role
              </label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="status" className="text-sm font-medium">
                Publish Status
              </label>
              <select
                id="status"
                name="status"
                className="border-input bg-background h-10 w-full rounded-xl border px-3 text-sm"
                defaultValue="OPEN"
              >
                <option value="OPEN">Publish immediately</option>
                <option value="DRAFT">Save as draft</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={pending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              {pending ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
