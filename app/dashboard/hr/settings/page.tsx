import { requireRole } from "@/lib/auth";
import { getHRSettings } from "@/lib/hr/queries";
import { HRSettingsPage } from "@/components/dashboard/hr/hr-settings-page";

export const dynamic = "force-dynamic";

export default async function HRSettingsRoute() {
  const user = await requireRole("HR");

  let settingsData;
  try {
    settingsData = await getHRSettings(user.id);
  } catch {
    settingsData = { hrProfile: null, settings: [] };
  }

  return (
    <HRSettingsPage
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
      }}
      hrProfile={settingsData.hrProfile}
    />
  );
}
