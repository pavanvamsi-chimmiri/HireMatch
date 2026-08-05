"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import {
  getCurrentUser,
  getPostAuthRedirect,
  parseUserRole,
  syncUserFromSupabase,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString().trim();
  const role = parseUserRole(formData.get("role")?.toString());

  if (!email || !password || !name || !role) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Authentication is not configured." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        profile_completed: false,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Unable to create account. Please try again." };
  }

  await syncUserFromSupabase(data.user.id, email, {
    name,
    role,
    profile_completed: false,
  });

  if (!data.session) {
    return {
      success: true,
      error: "Check your email to confirm your account, then sign in.",
    };
  }

  redirect("/profile");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirect")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Authentication is not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Invalid credentials." };
  }

  const user = await syncUserFromSupabase(
    data.user.id,
    data.user.email ?? email,
    data.user.user_metadata,
  );

  if (!user) {
    return {
      error: "Account is missing a valid role. Please contact support.",
    };
  }

  if (redirectTo && redirectTo.startsWith("/") && user.profileCompleted) {
    redirect(redirectTo);
  }

  redirect(getPostAuthRedirect(user));
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function completeProfileAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to complete your profile." };
  }

  const name = formData.get("name")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const bio = formData.get("bio")?.toString().trim() || null;

  if (!name) {
    return { error: "Name is required." };
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: user.id },
      data: {
        name,
        phone,
        bio,
        profileCompleted: true,
      },
    });

    if (user.role === "CANDIDATE") {
      await tx.candidateProfile.upsert({
        where: { userId: user.id },
        update: { summary: bio ?? undefined },
        create: { userId: user.id, summary: bio ?? undefined },
      });
    }

    if (user.role === "HR") {
      await tx.hRProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }

    return updated;
  });

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.updateUser({
      data: {
        name,
        profile_completed: true,
      },
    });
  }

  revalidatePath("/", "layout");
  redirect(getPostAuthRedirect({ ...updatedUser, profileCompleted: true }));
}

export async function updateProfileAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const name = formData.get("name")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const bio = formData.get("bio")?.toString().trim() || null;

  if (!name) {
    return { error: "Name is required." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { name, phone, bio },
    });

    if (user.role === "CANDIDATE") {
      await tx.candidateProfile.upsert({
        where: { userId: user.id },
        update: { summary: bio ?? undefined },
        create: { userId: user.id, summary: bio ?? undefined },
      });
    }
  });

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.updateUser({ data: { name } });
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");

  return { success: true };
}

export type RegisterRole = UserRole;
