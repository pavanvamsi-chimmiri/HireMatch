"use client";

import { Building2, Mail, User } from "lucide-react";
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
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue={user.name ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={user.email} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue={user.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title</label>
                <Input defaultValue={hrProfile?.jobTitle ?? ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input defaultValue={hrProfile?.linkedinUrl ?? ""} />
              </div>
              <Button className="w-fit bg-gradient-to-r from-blue-600 to-cyan-600 text-white md:col-span-2">
                Save Profile
              </Button>
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
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input defaultValue={hrProfile?.company?.name ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input defaultValue={hrProfile?.company?.website ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input defaultValue={hrProfile?.company?.industry ?? ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Location</label>
                <Input defaultValue={hrProfile?.company?.location ?? ""} />
              </div>
              <Button className="w-fit bg-gradient-to-r from-blue-600 to-cyan-600 text-white md:col-span-2">
                Save Company
              </Button>
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input defaultValue={hrProfile?.department ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hiring Focus</label>
                <textarea
                  defaultValue={hrProfile?.hiringFocus ?? ""}
                  rows={4}
                  className="border-input bg-background w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Describe the roles and seniority levels you hire for..."
                />
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
