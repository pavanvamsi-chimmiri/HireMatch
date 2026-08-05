import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { getAdminHRUsers } from "@/lib/admin/queries";
import { AdminSearchForm } from "@/components/dashboard/admin/admin-search-form";
import { UserStatusToggle } from "@/components/dashboard/admin/user-status-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

type HRPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminHRPage({ searchParams }: HRPageProps) {
  await requireRole("ADMIN");
  const { q } = await searchParams;

  let hrUsers: Awaited<ReturnType<typeof getAdminHRUsers>> = [];
  try {
    hrUsers = await getAdminHRUsers(q);
  } catch {
    hrUsers = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Managers</h1>
          <p className="text-muted-foreground mt-2">
            Manage HR accounts, companies, and hiring activity.
          </p>
        </div>
        <Suspense fallback={null}>
          <AdminSearchForm
            placeholder="Search HR by name or email..."
            defaultValue={q ?? ""}
          />
        </Suspense>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>HR Accounts</CardTitle>
          <CardDescription>
            {hrUsers.length} HR manager{hrUsers.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hrUsers.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No HR users found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HR Manager</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Jobs Posted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hrUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name ?? user.email}</p>
                        <p className="text-muted-foreground text-xs">
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.hrProfile?.company?.name ?? "—"}
                    </TableCell>
                    <TableCell>{user.hrProfile?.jobTitle ?? "—"}</TableCell>
                    <TableCell>{user._count.jobs}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "secondary" : "outline"}
                        className={
                          user.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "text-muted-foreground"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserStatusToggle
                        userId={user.id}
                        isActive={user.isActive}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
