"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleUserActiveAction(
  userId: string,
  isActive: boolean,
) {
  const admin = await requireRole("ADMIN");

  if (userId === admin.id) {
    return { success: false, error: "You cannot deactivate your own account." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return { success: false, error: "User not found." };
  }

  if (user.role === "ADMIN") {
    return { success: false, error: "Admin accounts cannot be deactivated." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !isActive },
  });

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/hr");
  revalidatePath("/dashboard/admin/candidates");
  revalidatePath("/dashboard/admin");

  return { success: true };
}

export async function updateSystemSettingAction(
  settingId: string,
  value: Prisma.InputJsonValue,
) {
  await requireRole("ADMIN");

  const setting = await prisma.setting.findFirst({
    where: { id: settingId, scope: "SYSTEM" },
  });

  if (!setting) {
    return { success: false, error: "Setting not found." };
  }

  await prisma.setting.update({
    where: { id: settingId },
    data: { value },
  });

  revalidatePath("/dashboard/admin/settings");

  return { success: true };
}
