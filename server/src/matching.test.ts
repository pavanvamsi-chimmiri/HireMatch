import { describe, expect, it } from "vitest";
import { scoreMatch } from "./matching.js";
import type { Candidate, Job } from "./types.js";

const baseJob: Job = {
  id: 1,
  title: "Backend Engineer",
  company: "Acme",
  location: "Austin, TX",
  remote: false,
  minYearsExperience: 4,
  skills: ["Node.js", "PostgreSQL", "REST"],
  description: "",
};

const baseCandidate: Candidate = {
  id: 1,
  name: "Test Candidate",
  title: "Engineer",
  location: "Austin, TX",
  remote: false,
  yearsExperience: 5,
  skills: ["Node.js", "PostgreSQL", "REST"],
  summary: "",
};

describe("scoreMatch", () => {
  it("gives a perfect score when skills, experience and location all match", () => {
    const result = scoreMatch(baseCandidate, baseJob);
    expect(result.score).toBe(100);
    expect(result.matchedSkills).toEqual(["Node.js", "PostgreSQL", "REST"]);
    expect(result.missingSkills).toEqual([]);
  });

  it("reports missing skills and lowers the skill score", () => {
    const candidate: Candidate = { ...baseCandidate, skills: ["Node.js"] };
    const result = scoreMatch(candidate, baseJob);
    expect(result.matchedSkills).toEqual(["Node.js"]);
    expect(result.missingSkills).toEqual(["PostgreSQL", "REST"]);
    expect(result.breakdown.skillScore).toBe(33);
    expect(result.score).toBeLessThan(100);
  });

  it("is case-insensitive when comparing skills", () => {
    const candidate: Candidate = { ...baseCandidate, skills: ["node.js", "postgresql", "rest"] };
    const result = scoreMatch(candidate, baseJob);
    expect(result.breakdown.skillScore).toBe(100);
  });

  it("penalises candidates below the required experience", () => {
    const candidate: Candidate = { ...baseCandidate, yearsExperience: 2 };
    const result = scoreMatch(candidate, baseJob);
    expect(result.breakdown.experienceScore).toBe(50);
  });

  it("treats a remote job as a location match regardless of city", () => {
    const remoteJob: Job = { ...baseJob, remote: true };
    const candidate: Candidate = { ...baseCandidate, location: "Remote City, ZZ" };
    const result = scoreMatch(candidate, remoteJob);
    expect(result.breakdown.locationScore).toBe(100);
  });

  it("applies a location penalty for an on-site mismatch", () => {
    const candidate: Candidate = { ...baseCandidate, location: "New York, NY", remote: false };
    const result = scoreMatch(candidate, baseJob);
    expect(result.breakdown.locationScore).toBe(20);
  });
});
