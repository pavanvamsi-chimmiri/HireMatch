import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createResumeSignedUrl,
  downloadResumeFromStorage,
} from "@/lib/resume/storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  const resume = await prisma.resume.findFirst({
    where: {
      id,
      candidateId: user.id,
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  if (!resume.storagePath) {
    return NextResponse.json(
      { error: "This resume is not available for preview." },
      { status: 404 },
    );
  }

  try {
    if (resume.mimeType === "application/pdf") {
      const signedUrl = await createResumeSignedUrl(resume.storagePath);
      return NextResponse.json({
        type: "pdf",
        url: signedUrl,
        fileName: resume.fileName,
      });
    }

    if (
      resume.mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      resume.mimeType === "application/msword"
    ) {
      const file = await downloadResumeFromStorage(resume.storagePath);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({
        buffer: Buffer.from(arrayBuffer),
      });

      return NextResponse.json({
        type: "docx",
        html: result.value,
        fileName: resume.fileName,
      });
    }

    return NextResponse.json(
      { error: "Preview is not supported for this file type." },
      { status: 415 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load preview.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
