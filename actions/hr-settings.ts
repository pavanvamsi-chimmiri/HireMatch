"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type HRSettingsActionState = {
  success?: boolean;
  error?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueCompanySlug(name: string) {
  const baseSlug = slugify(name) || "company";
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function updateHRProfileAction(
  _prevState: HRSettingsActionState,
  formData: FormData,
): Promise<HRSettingsActionState> {
  const user = await requireRole("HR");

  const name = formData.get("name")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const jobTitle = formData.get("jobTitle")?.toString().trim() || null;
  const linkedinUrl = formData.get("linkedinUrl")?.toString().trim() || null;

  if (!name) {
    return { error: "Full name is required." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { name, phone },
      });

      await tx.hRProfile.upsert({
        where: { userId: user.id },
        update: { jobTitle, linkedinUrl },
        create: {
          userId: user.id,
          jobTitle,
          linkedinUrl,
        },
      });
    });

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.updateUser({ data: { name } });
    }

    revalidatePath("/dashboard/hr/settings");
    revalidatePath("/dashboard/hr");

    return { success: true };
  } catch (error) {
    console.error("Failed to update HR profile:", error);
    return { error: "Could not save profile. Please try again." };
  }
}

export async function updateHRCompanyAction(
  _prevState: HRSettingsActionState,
  formData: FormData,
): Promise<HRSettingsActionState> {
  const user = await requireRole("HR");

  const companyName = formData.get("companyName")?.toString().trim();
  const website = formData.get("website")?.toString().trim() || null;
  const industry = formData.get("industry")?.toString().trim() || null;
  const location = formData.get("location")?.toString().trim() || null;

  if (!companyName) {
    return { error: "Company name is required." };
  }

  try {
    const hrProfile = await prisma.hRProfile.findUnique({
      where: { userId: user.id },
    });

    if (hrProfile?.companyId) {
      await prisma.company.update({
        where: { id: hrProfile.companyId },
        data: {
          name: companyName,
          website,
          industry,
          location,
        },
      });
    } else {
      const slug = await generateUniqueCompanySlug(companyName);
      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug,
          website,
          industry,
          location,
        },
      });

      await prisma.hRProfile.upsert({
        where: { userId: user.id },
        update: { companyId: company.id },
        create: {
          userId: user.id,
          companyId: company.id,
        },
      });
    }

    revalidatePath("/dashboard/hr/settings");
    revalidatePath("/dashboard/hr/jobs");

    return { success: true };
  } catch (error) {
    console.error("Failed to update company:", error);
    return { error: "Could not save company details. Please try again." };
  }
}

export async function updateHRHiringPreferencesAction(
  _prevState: HRSettingsActionState,
  formData: FormData,
): Promise<HRSettingsActionState> {
  const user = await requireRole("HR");

  const department = formData.get("department")?.toString().trim() || null;
  const hiringFocus = formData.get("hiringFocus")?.toString().trim() || null;

  try {
    await prisma.hRProfile.upsert({
      where: { userId: user.id },
      update: { department, hiringFocus },
      create: {
        userId: user.id,
        department,
        hiringFocus,
      },
    });

    revalidatePath("/dashboard/hr/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to update hiring preferences:", error);
    return {
      error: "Could not save hiring preferences. Please try again.",
    };
  }
}
