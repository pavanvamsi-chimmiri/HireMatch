import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/dashboard/admin/admin-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADMIN");

  return <AdminShell user={user}>{children}</AdminShell>;
}
