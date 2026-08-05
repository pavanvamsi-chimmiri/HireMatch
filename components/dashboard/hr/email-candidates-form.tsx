"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type EmailCandidatesFormProps = {
  candidates: {
    id: string;
    name: string | null;
    email: string;
    jobTitle?: string;
  }[];
};

export function EmailCandidatesForm({ candidates }: EmailCandidatesFormProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function toggleCandidate(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="border-border/50 h-fit">
        <CardHeader>
          <CardTitle className="text-base">Select Recipients</CardTitle>
          <CardDescription>
            Choose candidates from your applicant pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidates.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No candidates available yet.
            </p>
          ) : (
            candidates.map((candidate) => (
              <label
                key={candidate.id}
                className="border-border/50 hover:bg-muted/30 flex cursor-pointer items-start gap-3 rounded-xl border p-3"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(candidate.id)}
                  onChange={() => toggleCandidate(candidate.id)}
                  className="mt-1 size-4 rounded border"
                />
                <div>
                  <p className="text-sm font-medium">
                    {candidate.name ?? candidate.email}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {candidate.email}
                  </p>
                  {candidate.jobTitle && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Applied for {candidate.jobTitle}
                    </p>
                  )}
                </div>
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-700 dark:text-blue-300">
              <Mail className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Compose Email</CardTitle>
              <CardDescription>
                Send updates, interview invites, or follow-ups.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-6 text-sm text-emerald-700 dark:text-emerald-300">
              Email queued for {selectedIds.length || "selected"} candidate
              {selectedIds.length === 1 ? "" : "s"}. Delivery integration can be
              connected to Resend in production.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Interview invitation for Senior Engineer role"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={10}
                  required
                  placeholder="Write your message to candidates..."
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={selectedIds.length === 0}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
              >
                <Send className="mr-2 size-4" />
                Send to {selectedIds.length} candidate
                {selectedIds.length === 1 ? "" : "s"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
