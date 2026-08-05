"use client";

import { useEffect, useState } from "react";
import { Eye, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type PreviewData =
  | { type: "pdf"; url: string; fileName: string }
  | { type: "docx"; html: string; fileName: string };

type ResumePreviewProps = {
  resumeId: string;
  fileName: string;
  mimeType?: string | null;
};

export function ResumePreview({
  resumeId,
  fileName,
  mimeType,
}: ResumePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    if (!isOpen || preview) return;

    let cancelled = false;

    async function loadPreview() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/resumes/${resumeId}/preview`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load preview.");
        }

        if (!cancelled) {
          setPreview(data as PreviewData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load preview.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [isOpen, preview, resumeId]);

  function handleTogglePreview() {
    setIsOpen((open) => !open);
  }

  const fileLabel =
    mimeType === "application/pdf"
      ? "PDF"
      : mimeType?.includes("word") || fileName.endsWith(".docx")
        ? "DOCX"
        : "Document";

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Resume Preview</CardTitle>
          <CardDescription>
            Preview your uploaded {fileLabel} before applying to jobs.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleTogglePreview}>
          {isOpen ? (
            "Hide Preview"
          ) : (
            <>
              <Eye className="mr-2 size-4" />
              Preview
            </>
          )}
        </Button>
      </CardHeader>

      {isOpen && (
        <CardContent>
          {isLoading && (
            <div className="text-muted-foreground flex min-h-48 items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">Loading preview…</span>
            </div>
          )}

          {error && (
            <div className="border-destructive/20 bg-destructive/5 text-destructive flex min-h-32 items-center justify-center rounded-xl border px-4 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && preview?.type === "pdf" && (
            <div className="overflow-hidden rounded-xl border">
              <iframe
                title={`Preview of ${preview.fileName}`}
                src={preview.url}
                className="h-[70vh] w-full bg-white"
              />
            </div>
          )}

          {!isLoading && !error && preview?.type === "docx" && (
            <ScrollArea className="h-[70vh] rounded-xl border bg-white">
              <div
                className="prose prose-sm max-w-none p-6 text-slate-900"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </ScrollArea>
          )}

          {!isLoading && !error && !preview && (
            <div className="text-muted-foreground flex min-h-32 flex-col items-center justify-center gap-2">
              <FileText className="size-8 opacity-40" />
              <p className="text-sm">No preview available.</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
