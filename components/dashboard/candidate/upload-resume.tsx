"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { deleteResumeAction, setPrimaryResumeAction } from "@/actions/resume";
import { ResumePreview } from "@/components/dashboard/candidate/resume-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExtractedResumeData } from "@/components/dashboard/candidate/extracted-resume-data";
import { validateResumeFile } from "@/lib/resume/validation";
import type { ParsedResumeData } from "@/types/resume";
import { parsedResumeDataSchema } from "@/types/resume";

type ResumeItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  storagePath: string | null;
  fileSize: number | null;
  mimeType: string | null;
  status: string;
  isPrimary: boolean;
  uploadedAt: Date;
  parsedData: unknown;
};

function parseResumeData(value: unknown): ParsedResumeData | null {
  const parsed = parsedResumeDataSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

type UploadResumePageProps = {
  resumes: ResumeItem[];
};

const statusBadge: Record<string, string> = {
  UPLOADED: "bg-muted text-muted-foreground",
  PROCESSING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  PARSED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  FAILED: "bg-red-500/10 text-red-700 dark:text-red-300",
};

export function UploadResumeClient({ resumes }: UploadResumePageProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [replaceResumeId, setReplaceResumeId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(
    resumes.find((resume) => resume.isPrimary)?.id ?? resumes[0]?.id ?? null,
  );
  const [isPending, startTransition] = useTransition();

  const selectedResume =
    resumes.find((resume) => resume.id === selectedPreviewId) ?? null;

  useEffect(() => {
    const isParsing =
      selectedResume?.status === "UPLOADED" ||
      selectedResume?.status === "PROCESSING";

    if (!isParsing) return;

    const interval = window.setInterval(() => {
      router.refresh();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [router, selectedResume?.status]);

  function resetUploadState() {
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  }

  function uploadFile(file: File, replaceId?: string | null) {
    const validation = validateResumeFile(file.name, file.size, file.type);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    if (replaceId) {
      formData.append("replaceId", replaceId);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/resumes/upload");

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      resetUploadState();

      try {
        const data = JSON.parse(xhr.responseText) as {
          error?: string;
          resume?: ResumeItem;
          replaced?: boolean;
        };

        if (xhr.status >= 400) {
          setUploadError(data.error ?? "Upload failed.");
          return;
        }

        setUploadSuccess(
          data.replaced
            ? "Resume replaced successfully. Parsing your new resume…"
            : "Resume uploaded successfully. Parsing your resume…",
        );

        if (data.resume) {
          setSelectedPreviewId(data.resume.id);
        }

        router.refresh();
      } catch {
        setUploadError("Upload failed. Please try again.");
      }
    });

    xhr.addEventListener("error", () => {
      resetUploadState();
      setUploadError("Network error while uploading. Please try again.");
    });

    xhr.send(formData);
  }

  function handleUploadClick() {
    setReplaceResumeId(null);
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    uploadFile(file);
  }

  function handleReplaceClick(resumeId: string) {
    setReplaceResumeId(resumeId);
    replaceInputRef.current?.click();
  }

  function handleReplaceFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !replaceResumeId) return;
    uploadFile(file, replaceResumeId);
    setReplaceResumeId(null);
  }

  function handleDelete(resumeId: string) {
    startTransition(async () => {
      const result = await deleteResumeAction(resumeId);
      if (result.error) {
        setUploadError(result.error);
        return;
      }

      setPendingDeleteId(null);
      setUploadSuccess("Resume deleted successfully.");

      if (selectedPreviewId === resumeId) {
        const remaining = resumes.filter((resume) => resume.id !== resumeId);
        setSelectedPreviewId(remaining[0]?.id ?? null);
      }

      router.refresh();
    });
  }

  function handleSetPrimary(resumeId: string) {
    startTransition(async () => {
      const result = await setPrimaryResumeAction(resumeId);
      if (result.error) {
        setUploadError(result.error);
        return;
      }

      setUploadSuccess("Primary resume updated.");
      router.refresh();
    });
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
        <p className="text-muted-foreground mt-2">
          Upload your resume to apply for jobs. PDF and DOCX formats supported.
        </p>
      </div>

      {(uploadError || uploadSuccess) && (
        <div
          className={
            uploadError
              ? "border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm"
              : "rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
          }
        >
          {uploadError ?? uploadSuccess}
        </div>
      )}

      <Card
        className="border-border/50 border-dashed"
        onClick={!isUploading ? handleUploadClick : undefined}
      >
        <CardContent className="flex cursor-pointer flex-col items-center justify-center py-12">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleReplaceFileChange}
          />

          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10">
            {isUploading ? (
              <Loader2 className="size-7 animate-spin text-violet-600 dark:text-violet-400" />
            ) : (
              <Upload className="size-7 text-violet-600 dark:text-violet-400" />
            )}
          </div>

          <h3 className="mt-4 text-lg font-semibold">
            {isUploading
              ? "Uploading your resume…"
              : "Drop your resume here or click to browse"}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            PDF, DOC, DOCX up to 10MB
          </p>

          {!isUploading && (
            <Button
              className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={(event) => {
                event.stopPropagation();
                handleUploadClick();
              }}
            >
              Select File
            </Button>
          )}

          {isUploading && (
            <div className="mt-6 w-full max-w-xs space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-muted-foreground text-center text-xs">
                Uploading… {uploadProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedResume && (
        <ExtractedResumeData
          status={selectedResume.status}
          parsedData={parseResumeData(selectedResume.parsedData)}
        />
      )}

      {selectedResume?.storagePath && (
        <ResumePreview
          key={selectedResume.id}
          resumeId={selectedResume.id}
          fileName={selectedResume.fileName}
          mimeType={selectedResume.mimeType}
        />
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Your Resumes</CardTitle>
          <CardDescription>
            Manage uploaded resumes. Mark one as primary for applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12">
              <FileText className="size-10 opacity-40" />
              <p className="text-sm">No resumes uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="border-border/50 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                      <FileText className="text-muted-foreground size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="truncate text-left font-medium hover:underline"
                          onClick={() => setSelectedPreviewId(resume.id)}
                        >
                          {resume.fileName}
                        </button>
                        {resume.isPrimary && (
                          <Badge variant="secondary" className="text-[10px]">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {formatFileSize(resume.fileSize)} ·{" "}
                        {new Date(resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge
                      className={
                        statusBadge[resume.status] ?? statusBadge.UPLOADED
                      }
                    >
                      {resume.status === "PARSED" ? (
                        <CheckCircle2 className="mr-1 size-3" />
                      ) : resume.status === "FAILED" ? (
                        <AlertCircle className="mr-1 size-3" />
                      ) : null}
                      {resume.status.charAt(0) +
                        resume.status.slice(1).toLowerCase()}
                    </Badge>

                    {!resume.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleSetPrimary(resume.id)}
                      >
                        <Star className="mr-1 size-3.5" />
                        Set Primary
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUploading || isPending}
                      onClick={() => handleReplaceClick(resume.id)}
                    >
                      <RefreshCw className="mr-1 size-3.5" />
                      Replace
                    </Button>

                    {pendingDeleteId === resume.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleDelete(resume.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => setPendingDeleteId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => setPendingDeleteId(resume.id)}
                      >
                        <Trash2 className="mr-1 size-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
