import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { getAdminUsers } from "@/lib/admin/queries";
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

const roleStyles: Record<string, string> = {
  ADMIN: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  HR: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  CANDIDATE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

type UsersPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  await requireRole("ADMIN");
  const { q } = await searchParams;

  let users: Awaited<ReturnType<typeof getAdminUsers>> = [];
  try {
    users = await getAdminUsers(q);
  } catch {
    users = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage all platform accounts, roles, and account status.
          </p>
        </div>
        <Suspense fallback={null}>
          <AdminSearchForm
            placeholder="Search users by name or email..."
            defaultValue={q ?? ""}
          />
        </Suspense>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users.length} user{users.length === 1 ? "" : "s"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No users match your search.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
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
                      <Badge className={roleStyles[user.role] ?? roleStyles.HR}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.profileCompleted ? "Complete" : "Incomplete"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user._count.jobs} jobs · {user._count.applications} apps
                      · {user._count.resumes} resumes
                    </TableCell>
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
                        disabled={user.role === "ADMIN"}
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
