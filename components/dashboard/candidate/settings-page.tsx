"use client";

import { Bell, Mail, Moon, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type SettingsPageClientProps = {
  email: string;
  settings: {
    category: string;
    key: string;
    value: unknown;
  }[];
};

export function SettingsPageClient({
  email,
  settings,
}: SettingsPageClientProps) {
  const notificationPrefs = settings.find(
    (s) => s.category === "notifications" && s.key === "email_preferences",
  );
  const prefs = (notificationPrefs?.value as Record<string, boolean>) ?? {
    jobMatches: true,
    applicationUpdates: true,
    weeklyDigest: false,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and notifications.
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose what updates you receive via email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "jobMatches",
                  label: "Job Matches",
                  description: "Get notified when new jobs match your profile",
                  defaultChecked: prefs.jobMatches ?? true,
                },
                {
                  key: "applicationUpdates",
                  label: "Application Updates",
                  description: "Status changes on your applications",
                  defaultChecked: prefs.applicationUpdates ?? true,
                },
                {
                  key: "weeklyDigest",
                  label: "Weekly Digest",
                  description: "Summary of activity and new opportunities",
                  defaultChecked: prefs.weeklyDigest ?? false,
                },
              ].map((item, index) => (
                <div key={item.key}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultChecked}
                      className="border-border size-4 rounded accent-violet-600"
                    />
                  </div>
                </div>
              ))}
              <Button
                className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                disabled
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4" />
                Account Details
              </CardTitle>
              <CardDescription>
                Your login and account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email address</label>
                <Input value={email} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-4" />
                Privacy & Data
              </CardTitle>
              <CardDescription>
                Control how your data is used and shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-muted-foreground text-sm">
                    Allow recruiters to discover your profile
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded accent-violet-600"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    <Moon className="size-4" />
                    Dark Mode
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Use the theme toggle in the header to switch themes
                  </p>
                </div>
              </div>
              <Separator />
              <Button variant="destructive" size="sm" disabled>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
