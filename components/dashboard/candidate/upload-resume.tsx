"use client";

import { useRef, useState } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type ResumeItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  status: string;
  isPrimary: boolean;
  uploadedAt: Date;
};

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  function handleUploadClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
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

      <Card
        className="border-border/50 border-dashed"
        onClick={handleUploadClick}
      >
        <CardContent className="flex cursor-pointer flex-col items-center justify-center py-12">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10">
            <Upload className="size-7 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            Drop your resume here or click to browse
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            PDF, DOC, DOCX up to 10MB
          </p>
          <Button
            className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleUploadClick();
            }}
          >
            Select File
          </Button>
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
                  className="border-border/50 flex items-center gap-4 rounded-xl border p-4"
                >
                  <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <FileText className="text-muted-foreground size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{resume.fileName}</p>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
