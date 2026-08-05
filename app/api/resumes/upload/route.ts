import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildResumeStoragePath,
  deleteResumeFromStorage,
  uploadResumeToStorage,
} from "@/lib/resume/storage";
import { validateResumeFile } from "@/lib/resume/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload payload." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const replaceId = formData.get("replaceId")?.toString();

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A resume file is required." },
      { status: 400 },
    );
  }

  const validation = validateResumeFile(file.name, file.size, file.type);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = buildResumeStoragePath(user.id, file.name);

  let existingResume: Awaited<
    ReturnType<typeof prisma.resume.findFirst>
  > | null = null;

  if (replaceId) {
    existingResume = await prisma.resume.findFirst({
      where: { id: replaceId, candidateId: user.id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }
  }

  try {
    await uploadResumeToStorage(storagePath, buffer, validation.mimeType);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    if (existingResume) {
      const updated = await prisma.$transaction(async (tx) => {
        const resume = await tx.resume.update({
          where: { id: existingResume!.id },
          data: {
            fileName: file.name,
            fileUrl: storagePath,
            storagePath,
            fileSize: file.size,
            mimeType: validation.mimeType,
            status: "UPLOADED",
            uploadedAt: new Date(),
          },
        });

        if (existingResume!.storagePath) {
          await deleteResumeFromStorage(existingResume!.storagePath).catch(
            () => undefined,
          );
        }

        return resume;
      });

      return NextResponse.json({ resume: updated, replaced: true });
    }

    const resumeCount = await prisma.resume.count({
      where: { candidateId: user.id },
    });

    const resume = await prisma.resume.create({
      data: {
        candidateId: user.id,
        fileName: file.name,
        fileUrl: storagePath,
        storagePath,
        fileSize: file.size,
        mimeType: validation.mimeType,
        isPrimary: resumeCount === 0,
      },
    });

    return NextResponse.json({ resume, replaced: false });
  } catch (error) {
    await deleteResumeFromStorage(storagePath).catch(() => undefined);

    const message =
      error instanceof Error ? error.message : "Failed to save resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
