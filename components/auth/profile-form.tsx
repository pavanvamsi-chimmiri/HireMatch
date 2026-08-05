"use client";

import { useActionState } from "react";
import type { UserRole } from "@prisma/client";
import {
  completeProfileAction,
  updateProfileAction,
  type AuthActionState,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ProfileFormProps = {
  mode: "setup" | "edit";
  defaultValues: {
    name: string;
    phone: string;
    bio: string;
    role: UserRole;
  };
};

const initialState: AuthActionState = {};

export function ProfileForm({ mode, defaultValues }: ProfileFormProps) {
  const action = mode === "setup" ? completeProfileAction : updateProfileAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Card className="border-border/50 w-full max-w-lg shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">
              {mode === "setup" ? "Complete your profile" : "Your profile"}
            </CardTitle>
            <CardDescription className="mt-1">
              {mode === "setup"
                ? "Tell us a bit about yourself before accessing your dashboard."
                : "Update your personal information."}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {defaultValues.role === "HR" ? "HR" : "Candidate"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={defaultValues.name}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaultValues.phone}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={defaultValues.bio}
              rows={4}
              placeholder={
                defaultValues.role === "HR"
                  ? "Tell candidates about your company and hiring focus..."
                  : "Share your skills, experience, and career goals..."
              }
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
            />
          </div>

          {state.error && (
            <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
              {state.error}
            </p>
          )}

          {state.success && mode === "edit" && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              Profile updated successfully.
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
          >
            {isPending
              ? "Saving..."
              : mode === "setup"
                ? "Continue to Dashboard"
                : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
