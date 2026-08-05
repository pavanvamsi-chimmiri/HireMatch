import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import type { Candidate, Job } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.HIREMATCH_DB ?? join(dataDir, "hirematch.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      remote INTEGER NOT NULL DEFAULT 0,
      minYearsExperience INTEGER NOT NULL DEFAULT 0,
      skills TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      remote INTEGER NOT NULL DEFAULT 0,
      yearsExperience INTEGER NOT NULL DEFAULT 0,
      skills TEXT NOT NULL DEFAULT '[]',
      summary TEXT NOT NULL DEFAULT ''
    );
  `);
}

interface JobRow {
  id: number;
  title: string;
  company: string;
  location: string;
  remote: number;
  minYearsExperience: number;
  skills: string;
  description: string;
}

interface CandidateRow {
  id: number;
  name: string;
  title: string;
  location: string;
  remote: number;
  yearsExperience: number;
  skills: string;
  summary: string;
}

const rowToJob = (row: JobRow): Job => ({
  id: row.id,
  title: row.title,
  company: row.company,
  location: row.location,
  remote: Boolean(row.remote),
  minYearsExperience: row.minYearsExperience,
  skills: JSON.parse(row.skills) as string[],
  description: row.description,
});

const rowToCandidate = (row: CandidateRow): Candidate => ({
  id: row.id,
  name: row.name,
  title: row.title,
  location: row.location,
  remote: Boolean(row.remote),
  yearsExperience: row.yearsExperience,
  skills: JSON.parse(row.skills) as string[],
  summary: row.summary,
});

export function listJobs(): Job[] {
  const rows = db.prepare("SELECT * FROM jobs ORDER BY id").all() as JobRow[];
  return rows.map(rowToJob);
}

export function getJob(id: number): Job | undefined {
  const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
  return row ? rowToJob(row) : undefined;
}

export function insertJob(job: Omit<Job, "id">): Job {
  const result = db
    .prepare(
      `INSERT INTO jobs (title, company, location, remote, minYearsExperience, skills, description)
       VALUES (@title, @company, @location, @remote, @minYearsExperience, @skills, @description)`,
    )
    .run({
      ...job,
      remote: job.remote ? 1 : 0,
      skills: JSON.stringify(job.skills),
    });
  return getJob(Number(result.lastInsertRowid))!;
}

export function listCandidates(): Candidate[] {
  const rows = db.prepare("SELECT * FROM candidates ORDER BY id").all() as CandidateRow[];
  return rows.map(rowToCandidate);
}

export function getCandidate(id: number): Candidate | undefined {
  const row = db.prepare("SELECT * FROM candidates WHERE id = ?").get(id) as
    | CandidateRow
    | undefined;
  return row ? rowToCandidate(row) : undefined;
}

export function insertCandidate(candidate: Omit<Candidate, "id">): Candidate {
  const result = db
    .prepare(
      `INSERT INTO candidates (name, title, location, remote, yearsExperience, skills, summary)
       VALUES (@name, @title, @location, @remote, @yearsExperience, @skills, @summary)`,
    )
    .run({
      ...candidate,
      remote: candidate.remote ? 1 : 0,
      skills: JSON.stringify(candidate.skills),
    });
  return getCandidate(Number(result.lastInsertRowid))!;
}

export function countRows(table: "jobs" | "candidates"): number {
  const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number };
  return row.n;
}
