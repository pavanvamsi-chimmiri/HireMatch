import { Router } from "express";
import { z } from "zod";
import { getJob, insertJob, listCandidates, listJobs } from "../db.js";
import { scoreMatch } from "../matching.js";
import type { CandidateMatch } from "../types.js";

export const jobsRouter = Router();

const jobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  remote: z.boolean().default(false),
  minYearsExperience: z.number().int().min(0).default(0),
  skills: z.array(z.string().min(1)).default([]),
  description: z.string().default(""),
});

jobsRouter.get("/", (_req, res) => {
  res.json(listJobs());
});

jobsRouter.get("/:id", (req, res) => {
  const job = getJob(Number(req.params.id));
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

jobsRouter.post("/", (req, res) => {
  const parsed = jobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid job", details: parsed.error.flatten() });
  }
  res.status(201).json(insertJob(parsed.data));
});

// Ranked candidates for a given job.
jobsRouter.get("/:id/matches", (req, res) => {
  const job = getJob(Number(req.params.id));
  if (!job) return res.status(404).json({ error: "Job not found" });

  const matches: CandidateMatch[] = listCandidates()
    .map((candidate) => {
      const result = scoreMatch(candidate, job);
      return { candidate, ...result };
    })
    .sort((a, b) => b.score - a.score);

  res.json({ job, matches });
});
