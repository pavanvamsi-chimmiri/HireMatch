import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/auth/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CandidateProfilePage() {
  const user = await requireRole("CANDIDATE");

  let profile = null;
  try {
    profile = await prisma.candidateProfile.findUnique({
      where: { userId: user.id },
    });
  } catch {
    profile = null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and candidate profile.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileForm
            mode="edit"
            defaultValues={{
              name: user.name ?? "",
              phone: user.phone ?? "",
              bio: user.bio ?? "",
              role: user.role,
            }}
          />
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Profile Status</CardTitle>
              <CardDescription>Your account overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Role</span>
                <Badge variant="secondary">Candidate</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Profile</span>
                <Badge
                  className={
                    user.profileCompleted
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                  }
                >
                  {user.profileCompleted ? "Complete" : "Incomplete"}
                </Badge>
              </div>
              <span className="text-sm">Active</span>
            </CardContent>
          </Card>

          {profile && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Professional Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {profile.headline && (
                  <div>
                    <span className="text-muted-foreground">Headline</span>
                    <p className="mt-0.5 font-medium">{profile.headline}</p>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <p className="mt-0.5">{profile.location}</p>
                  </div>
                )}
                {profile.skills.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Skills</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
