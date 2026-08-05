import { requireRole } from "@/lib/auth";
import { getAdminSettings } from "@/lib/admin/queries";
import { AdminSettingsForm } from "@/components/dashboard/admin/admin-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");

  let settings: Awaited<ReturnType<typeof getAdminSettings>> = [];
  try {
    settings = await getAdminSettings();
  } catch {
    settings = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Configure platform-wide system settings for AI matching, defaults, and
          operational behavior.
        </p>
      </div>

      <AdminSettingsForm settings={settings} />
    </div>
  );
}
