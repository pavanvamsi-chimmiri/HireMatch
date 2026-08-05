import type { CandidateMatch, Job } from "./types";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${path}`);
  }
  return (await res.json()) as T;
}

export function fetchJobs(): Promise<Job[]> {
  return request<Job[]>("/api/jobs");
}

export function fetchJobMatches(jobId: number): Promise<{ job: Job; matches: CandidateMatch[] }> {
  return request<{ job: Job; matches: CandidateMatch[] }>(`/api/jobs/${jobId}/matches`);
}
