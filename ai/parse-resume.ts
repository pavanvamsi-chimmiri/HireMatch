import { DEFAULT_MODEL, getOpenAIClient } from "@/ai/client";
import { parsedResumeDataSchema, type ParsedResumeData } from "@/types/resume";

const RESUME_PARSE_PROMPT = `You are an expert resume parser. Extract structured information from the resume text below.

Return a JSON object with exactly these fields:
- name: string | null
- phone: string | null
- email: string | null
- education: array of { institution, degree?, field?, startDate?, endDate? }
- skills: string[]
- experience: array of { title, company, location?, startDate?, endDate?, description? }
- projects: array of { name, description?, technologies?: string[], url? }
- certifications: string[]
- technologies: string[] (programming languages, frameworks, tools)
- experienceYears: number | null (total years of professional experience)

Rules:
- Use null for missing scalar fields, empty arrays for missing lists
- Normalize phone numbers when possible
- Do not invent information not present in the resume
- Separate "skills" (general competencies) from "technologies" (tools/languages/frameworks) when possible`;

export async function parseResumeWithAI(
  resumeText: string,
): Promise<ParsedResumeData> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RESUME_PARSE_PROMPT },
      {
        role: "user",
        content: resumeText.slice(0, 12000),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI resume parser returned an empty response.");
  }

  const json = JSON.parse(content) as unknown;
  const parsed = parsedResumeDataSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("AI resume parser returned invalid structured data.");
  }

  return parsed.data;
}

export function parseResumeWithHeuristics(
  resumeText: string,
): ParsedResumeData {
  const emailMatch = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = resumeText.match(
    /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
  );

  const lines = resumeText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const name = lines[0]?.length && lines[0].length < 80 ? lines[0] : null;

  return parsedResumeDataSchema.parse({
    name,
    phone: phoneMatch?.[0] ?? null,
    email: emailMatch?.[0] ?? null,
    education: [],
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    technologies: [],
    experienceYears: null,
  });
}
