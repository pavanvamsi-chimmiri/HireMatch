import { Router } from "express";
import { z } from "zod";
import { getCandidate, insertCandidate, listCandidates, listJobs } from "../db.js";
import { scoreMatch } from "../matching.js";
import type { JobMatch } from "../types.js";

export const candidatesRouter = Router();

const candidateSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  remote: z.boolean().default(false),
  yearsExperience: z.number().int().min(0).default(0),
  skills: z.array(z.string().min(1)).default([]),
  summary: z.string().default(""),
});

candidatesRouter.get("/", (_req, res) => {
  res.json(listCandidates());
});

candidatesRouter.get("/:id", (req, res) => {
  const candidate = getCandidate(Number(req.params.id));
  if (!candidate) return res.status(404).json({ error: "Candidate not found" });
  res.json(candidate);
});

candidatesRouter.post("/", (req, res) => {
  const parsed = candidateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid candidate", details: parsed.error.flatten() });
  }
  res.status(201).json(insertCandidate(parsed.data));
});

// Ranked jobs for a given candidate.
candidatesRouter.get("/:id/matches", (req, res) => {
  const candidate = getCandidate(Number(req.params.id));
  if (!candidate) return res.status(404).json({ error: "Candidate not found" });

  const matches: JobMatch[] = listJobs()
    .map((job) => {
      const result = scoreMatch(candidate, job);
      return { job, ...result };
    })
    .sort((a, b) => b.score - a.score);

  res.json({ candidate, matches });
});
