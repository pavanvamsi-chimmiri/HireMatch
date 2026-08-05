import { DEFAULT_MODEL, getOpenAIClient } from "@/ai/client";
import {
  jobAnalysisResultSchema,
  type JobAnalysisResult,
} from "@/types/job-analysis";

const JOB_ANALYSIS_PROMPT = `You are an expert recruiter and job description analyst. Extract structured hiring requirements from the job posting.

Return JSON with exactly these fields:
- skills: string[] (general professional skills)
- technologies: string[] (tools, languages, frameworks, platforms)
- education: string[] (degree levels, fields of study, certifications mentioned)
- experience: { summary: string | null, minimumYears: number | null, level: string | null }
- responsibilities: string[] (key duties extracted or summarized as bullet-style strings)
- keywords: string[] (important ATS keywords and role-specific terms)

Rules:
- Extract only what is supported by the posting
- Use concise strings
- Separate general skills from technologies when possible
- Do not invent requirements not present in the text`;

export type JobAnalysisInput = {
  title: string;
  description: string;
  qualifications?: string | null;
  responsibilities?: string | null;
  experienceRequired?: string | null;
  skillsRequired?: string[];
  location?: string | null;
  employmentType?: string | null;
};

function buildJobAnalysisText(input: JobAnalysisInput): string {
  return [
    `Job Title: ${input.title}`,
    input.location ? `Location: ${input.location}` : null,
    input.employmentType ? `Employment Type: ${input.employmentType}` : null,
    input.experienceRequired
      ? `Experience Required: ${input.experienceRequired}`
      : null,
    input.skillsRequired?.length
      ? `Listed Skills: ${input.skillsRequired.join(", ")}`
      : null,
    input.qualifications ? `Qualifications:\n${input.qualifications}` : null,
    input.responsibilities
      ? `Responsibilities:\n${input.responsibilities}`
      : null,
    `Complete Job Description:\n${input.description}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function analyzeJobWithAI(
  input: JobAnalysisInput,
): Promise<JobAnalysisResult> {
  const client = getOpenAIClient();
  const jobText = buildJobAnalysisText(input);

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: JOB_ANALYSIS_PROMPT },
      { role: "user", content: jobText.slice(0, 12000) },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI job analysis returned an empty response.");
  }

  const json = JSON.parse(content) as unknown;
  const parsed = jobAnalysisResultSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("AI job analysis returned invalid structured data.");
  }

  return parsed.data;
}

export function analyzeJobWithHeuristics(
  input: JobAnalysisInput,
): JobAnalysisResult {
  const text = buildJobAnalysisText(input).toLowerCase();
  const skills = [...(input.skillsRequired ?? [])];

  const techCandidates = [
    "typescript",
    "javascript",
    "react",
    "node.js",
    "nodejs",
    "python",
    "java",
    "aws",
    "postgresql",
    "kubernetes",
    "docker",
    "figma",
    "graphql",
  ];

  const technologies = techCandidates.filter((tech) => text.includes(tech));

  const educationKeywords = [
    "bachelor",
    "master",
    "phd",
    "degree",
    "computer science",
    "certification",
  ];
  const education = educationKeywords.filter((item) => text.includes(item));

  const responsibilities = input.responsibilities
    ? input.responsibilities
        .split("\n")
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
    : [];

  const keywords = [...new Set([...skills, ...technologies, ...education])]
    .slice(0, 12)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  const yearMatch = input.experienceRequired?.match(/\d+/);
  const minimumYears = yearMatch ? Number(yearMatch[0]) : null;

  return jobAnalysisResultSchema.parse({
    skills,
    technologies: technologies.map(
      (tech) => tech.charAt(0).toUpperCase() + tech.slice(1),
    ),
    education: education.map(
      (item) => item.charAt(0).toUpperCase() + item.slice(1),
    ),
    experience: {
      summary: input.experienceRequired ?? null,
      minimumYears,
      level: minimumYears && minimumYears >= 5 ? "Senior" : "Mid-level",
    },
    responsibilities,
    keywords,
  });
}

export { buildJobAnalysisText };
