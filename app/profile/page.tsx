import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/profile-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams: Promise<{ setup?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const isSetup = params.setup === "true" || !user.profileCompleted;
  const mode = isSetup ? "setup" : "edit";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-600/15 to-transparent blur-3xl" />
      </div>

      <ProfileForm
        mode={mode}
        defaultValues={{
          name: user.name ?? "",
          phone: user.phone ?? "",
          bio: user.bio ?? "",
          role: user.role,
        }}
      />
    </div>
  );
}
