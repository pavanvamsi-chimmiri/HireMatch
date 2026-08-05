import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { RESUME_BUCKET } from "@/lib/resume/constants";
import { sanitizeResumeFileName } from "@/lib/resume/validation";

export function buildResumeStoragePath(userId: string, fileName: string) {
  const safeName = sanitizeResumeFileName(fileName);
  return `${userId}/${Date.now()}-${safeName}`;
}

export async function uploadResumeToStorage(
  storagePath: string,
  file: Buffer,
  mimeType: string,
) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Storage is not configured.");
  }

  const { error } = await admin.storage
    .from(RESUME_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return storagePath;
}

export async function deleteResumeFromStorage(storagePath: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Storage is not configured.");
  }

  const { error } = await admin.storage
    .from(RESUME_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createResumeSignedUrl(
  storagePath: string,
  expiresInSeconds = 3600,
) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Storage is not configured.");
  }

  const { data, error } = await admin.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Unable to create preview URL.");
  }

  return data.signedUrl;
}

export async function downloadResumeFromStorage(storagePath: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Storage is not configured.");
  }

  const { data, error } = await admin.storage
    .from(RESUME_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to download resume.");
  }

  return data;
}
