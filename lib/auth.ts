import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  supabaseId: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  profileCompleted: boolean;
};

export function getDashboardPath(role: UserRole): string {
  if (role === "ADMIN") return "/dashboard/admin";
  return role === "HR" ? "/dashboard/hr" : "/dashboard/candidate";
}

export function getPostAuthRedirect(user: AuthUser): string {
  if (!user.profileCompleted) {
    return "/profile";
  }
  return getDashboardPath(user.role);
}

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: session.id },
  });

  if (dbUser) {
    return dbUser;
  }

  return syncUserFromSupabase(
    session.id,
    session.email!,
    session.user_metadata,
  );
}

export async function syncUserFromSupabase(
  supabaseId: string,
  email: string,
  metadata: Record<string, unknown> = {},
): Promise<AuthUser | null> {
  const role = parseUserRole(metadata.role);
  const name = typeof metadata.name === "string" ? metadata.name : null;
  const profileCompleted =
    typeof metadata.profile_completed === "boolean"
      ? metadata.profile_completed
      : false;

  if (!role) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { supabaseId },
    update: {
      email,
      name: name ?? undefined,
    },
    create: {
      supabaseId,
      email,
      name,
      role,
      profileCompleted,
    },
  });

  if (role === "CANDIDATE") {
    await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  if (role === "HR") {
    await prisma.hRProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  return user;
}

export function parseUserRole(value: unknown): UserRole | null {
  if (value === "ADMIN" || value === "HR" || value === "CANDIDATE") {
    return value;
  }
  return null;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.profileCompleted) {
    redirect("/profile");
  }
  if (user.role !== role) {
    redirect(getDashboardPath(user.role));
  }
  return user;
}

export async function requireProfileCompleted(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.profileCompleted) {
    redirect("/profile");
  }
  return user;
}
