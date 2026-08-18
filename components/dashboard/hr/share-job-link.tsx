"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ShareJobLinkProps = {
  publicUrl: string;
  jobTitle: string;
  isOpen: boolean;
};

export function ShareJobLink({
  publicUrl,
  jobTitle,
  isOpen,
}: ShareJobLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="size-4" />
          Share on LinkedIn / Naukri
        </CardTitle>
        <CardDescription>
          {isOpen
            ? `Share this link in your ${jobTitle} posting so candidates apply directly in HireMatch.`
            : "Set the job status to Open to enable the public apply link."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Input value={publicUrl} readOnly className="font-mono text-xs" />
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={!isOpen}
          className="shrink-0"
        >
          {copied ? (
            <>
              <Check className="mr-2 size-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 size-4" />
              Copy link
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
