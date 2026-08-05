"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Briefcase, Sparkles, UserRound } from "lucide-react";
import { signUpAction, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <Card className="border-border/50 w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Choose your role and start using HireMatch AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">I am registering as</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="HR"
                  className="peer sr-only"
                  defaultChecked
                  required
                />
                <div
                  className={cn(
                    "border-border/60 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                    "peer-checked:border-violet-500 peer-checked:bg-violet-500/10 peer-checked:shadow-sm",
                  )}
                >
                  <Briefcase className="size-5 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm font-semibold">HR</span>
                  <span className="text-muted-foreground text-xs">
                    Hire talent
                  </span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="CANDIDATE"
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "border-border/60 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                    "peer-checked:border-violet-500 peer-checked:bg-violet-500/10 peer-checked:shadow-sm",
                  )}
                >
                  <UserRound className="size-5 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm font-semibold">Candidate</span>
                  <span className="text-muted-foreground text-xs">
                    Find jobs
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-muted-foreground text-xs">
              Must be at least 8 characters.
            </p>
          </div>

          {state.error && (
            <p
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                state.success
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-violet-600 hover:underline dark:text-violet-400"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
