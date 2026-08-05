import { countRows, insertCandidate, insertJob } from "./db.js";
import type { Candidate, Job } from "./types.js";

const jobs: Omit<Job, "id">[] = [
  {
    title: "Senior Frontend Engineer",
    company: "Northwind Labs",
    location: "San Francisco, CA",
    remote: true,
    minYearsExperience: 5,
    skills: ["TypeScript", "React", "CSS", "GraphQL", "Testing"],
    description:
      "Build delightful, accessible interfaces for our analytics platform used by thousands of teams.",
  },
  {
    title: "Backend Engineer",
    company: "Northwind Labs",
    location: "San Francisco, CA",
    remote: false,
    minYearsExperience: 3,
    skills: ["Node.js", "PostgreSQL", "REST", "Docker", "TypeScript"],
    description: "Design and scale the APIs that power HireMatch's recommendation engine.",
  },
  {
    title: "Data Scientist",
    company: "Meridian Health",
    location: "Boston, MA",
    remote: true,
    minYearsExperience: 4,
    skills: ["Python", "Machine Learning", "SQL", "Statistics", "Pandas"],
    description: "Develop predictive models that improve patient outcomes across our network.",
  },
  {
    title: "DevOps Engineer",
    company: "Cobalt Systems",
    location: "Austin, TX",
    remote: true,
    minYearsExperience: 4,
    skills: ["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD"],
    description: "Own our cloud infrastructure and keep deployments fast, safe and observable.",
  },
  {
    title: "Product Designer",
    company: "Cobalt Systems",
    location: "Austin, TX",
    remote: false,
    minYearsExperience: 2,
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    description: "Shape the end-to-end experience of our developer tooling suite.",
  },
];

const candidates: Omit<Candidate, "id">[] = [
  {
    name: "Ava Thompson",
    title: "Frontend Engineer",
    location: "San Francisco, CA",
    remote: true,
    yearsExperience: 6,
    skills: ["TypeScript", "React", "CSS", "GraphQL", "Testing", "Node.js"],
    summary: "Product-minded UI engineer who loves design systems and fast, accessible apps.",
  },
  {
    name: "Marcus Lee",
    title: "Full-stack Developer",
    location: "Seattle, WA",
    remote: true,
    yearsExperience: 4,
    skills: ["Node.js", "TypeScript", "PostgreSQL", "REST", "React"],
    summary: "Full-stack generalist comfortable across the API and UI layers.",
  },
  {
    name: "Priya Nair",
    title: "Machine Learning Engineer",
    location: "Boston, MA",
    remote: true,
    yearsExperience: 5,
    skills: ["Python", "Machine Learning", "SQL", "Pandas", "Statistics", "TensorFlow"],
    summary: "ML engineer focused on healthcare models and rigorous evaluation.",
  },
  {
    name: "Diego Ramirez",
    title: "Platform Engineer",
    location: "Austin, TX",
    remote: true,
    yearsExperience: 3,
    skills: ["Kubernetes", "AWS", "Docker", "CI/CD", "Terraform", "Go"],
    summary: "Infrastructure engineer who enjoys automating everything that moves.",
  },
  {
    name: "Sofia Rossi",
    title: "Junior Backend Engineer",
    location: "New York, NY",
    remote: false,
    yearsExperience: 2,
    skills: ["Node.js", "REST", "PostgreSQL"],
    summary: "Early-career backend engineer eager to grow on a strong team.",
  },
  {
    name: "Liam O'Connor",
    title: "Product Designer",
    location: "Austin, TX",
    remote: false,
    yearsExperience: 4,
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
    summary: "Designer bridging research and polished, systematic interfaces.",
  },
];

export function seedIfEmpty(): void {
  if (countRows("jobs") === 0) {
    for (const job of jobs) insertJob(job);
  }
  if (countRows("candidates") === 0) {
    for (const candidate of candidates) insertCandidate(candidate);
  }
}
