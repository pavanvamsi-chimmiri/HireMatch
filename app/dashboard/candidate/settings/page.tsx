import { requireRole } from "@/lib/auth";
import { getCandidateSettings } from "@/lib/candidate/queries";
import { SettingsPageClient } from "@/components/dashboard/candidate/settings-page";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireRole("CANDIDATE");

  let settings: Awaited<ReturnType<typeof getCandidateSettings>> = [];
  try {
    settings = await getCandidateSettings(user.id);
  } catch {
    settings = [];
  }

  return <SettingsPageClient email={user.email} settings={settings} />;
}
