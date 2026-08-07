"use client";

import { useActionState } from "react";
import { Building2, Mail, User } from "lucide-react";
import {
  updateHRCompanyAction,
  updateHRHiringPreferencesAction,
  updateHRProfileAction,
  type HRSettingsActionState,
} from "@/actions/hr-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HRSettingsPageProps = {
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  hrProfile: {
    jobTitle: string | null;
    department: string | null;
    linkedinUrl: string | null;
    hiringFocus: string | null;
    company: {
      name: string;
      website: string | null;
      industry: string | null;
      location: string | null;
    } | null;
  } | null;
};

const initialState: HRSettingsActionState = {};

function FormMessage({ state }: { state: HRSettingsActionState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-sm md:col-span-2",
        state.success
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {state.success ? "Saved successfully." : state.error}
    </p>
  );
}

function ProfileSettingsForm({
  user,
  hrProfile,
}: {
  user: HRSettingsPageProps["user"];
  hrProfile: HRSettingsPageProps["hrProfile"];
}) {
  const [state, formAction, isPending] = useActionState(
    updateHRProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Full Name
        </label>
        <Input id="name" name="name" defaultValue={user.name ?? ""} required />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" defaultValue={user.email} disabled />
      </div>
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="jobTitle" className="text-sm font-medium">
          Job Title
        </label>
        <Input
          id="jobTitle"
          name="jobTitle"
          defaultValue={hrProfile?.jobTitle ?? ""}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="linkedinUrl" className="text-sm font-medium">
          LinkedIn URL
        </label>
        <Input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/your-profile"
          defaultValue={hrProfile?.linkedinUrl ?? ""}
        />
      </div>
      <FormMessage state={state} />
      <Button
        type="submit"
        disabled={isPending}
        className="w-fit bg-gradient-to-r from-blue-600 to-cyan-600 text-white md:col-span-2"
      >
        {isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}

function CompanySettingsForm({
  hrProfile,
}: {
  hrProfile: HRSettingsPageProps["hrProfile"];
}) {
  const [state, formAction, isPending] = useActionState(
    updateHRCompanyAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="companyName" className="text-sm font-medium">
          Company Name
        </label>
        <Input
          id="companyName"
          name="companyName"
          defaultValue={hrProfile?.company?.name ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="website" className="text-sm font-medium">
          Website
        </label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://company.com"
          defaultValue={hrProfile?.company?.website ?? ""}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="industry" className="text-sm font-medium">
          Industry
        </label>
        <Input
          id="industry"
          name="industry"
          defaultValue={hrProfile?.company?.industry ?? ""}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="location" className="text-sm font-medium">
          Location
        </label>
        <Input
          id="location"
          name="location"
          defaultValue={hrProfile?.company?.location ?? ""}
        />
      </div>
      <FormMessage state={state} />
      <Button
        type="submit"
        disabled={isPending}
        className="w-fit bg-gradient-to-r from-blue-600 to-cyan-600 text-white md:col-span-2"
      >
        {isPending ? "Saving..." : "Save Company"}
      </Button>
    </form>
  );
}

function HiringPreferencesForm({
  hrProfile,
}: {
  hrProfile: HRSettingsPageProps["hrProfile"];
}) {
  const [state, formAction, isPending] = useActionState(
    updateHRHiringPreferencesAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="department" className="text-sm font-medium">
          Department
        </label>
        <Input
          id="department"
          name="department"
          defaultValue={hrProfile?.department ?? ""}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="hiringFocus" className="text-sm font-medium">
          Hiring Focus
        </label>
        <textarea
          id="hiringFocus"
          name="hiringFocus"
          defaultValue={hrProfile?.hiringFocus ?? ""}
          rows={4}
          className="border-input bg-background w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Describe the roles and seniority levels you hire for..."
        />
      </div>
      <FormMessage state={state} />
      <Button
        type="submit"
        disabled={isPending}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
      >
        {isPending ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  );
}

export function HRSettingsPage({ user, hrProfile }: HRSettingsPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your HR profile, company details, and hiring preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="hiring">Hiring</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" />
                HR Profile
              </CardTitle>
              <CardDescription>
                Your recruiter identity across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm user={user} hrProfile={hrProfile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4" />
                Company
              </CardTitle>
              <CardDescription>
                Organization details shown on job listings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanySettingsForm hrProfile={hrProfile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiring">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4" />
                Hiring Preferences
              </CardTitle>
              <CardDescription>
                Defaults for outreach and candidate communication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HiringPreferencesForm hrProfile={hrProfile} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
