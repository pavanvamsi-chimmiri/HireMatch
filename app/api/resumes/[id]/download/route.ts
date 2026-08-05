import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getResumeForUserAccess } from "@/lib/hr/candidate-access";
import { createResumeSignedUrl } from "@/lib/resume/storage";

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

  const resume = await getResumeForUserAccess(user.id, user.role, id);

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  if (!resume.storagePath) {
    return NextResponse.json(
      { error: "This resume is not available for download." },
      { status: 404 },
    );
  }

  try {
    const signedUrl = await createResumeSignedUrl(resume.storagePath);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to download resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
