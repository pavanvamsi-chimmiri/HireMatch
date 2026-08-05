import { DEFAULT_MODEL, getOpenAIClient } from "@/ai/client";
import {
  resumeAnalysisResultSchema,
  type ResumeAnalysisResult,
} from "@/types/resume-analysis";
import type { ParsedResumeData } from "@/types/resume";

const RESUME_ANALYSIS_PROMPT = `You are an expert resume coach and ATS specialist. Analyze the candidate resume and return actionable feedback.

Evaluate:
1. ATS compatibility (formatting, keywords, parseability, standard sections)
2. Overall resume quality (clarity, impact, achievements, structure)
3. Skill gaps relative to modern industry expectations for the candidate's role level
4. Concrete improvements

Return JSON with exactly these fields:
- atsScore: number 0-100
- resumeScore: number 0-100
- professionalSummary: string (2-4 polished sentences summarizing the candidate)
- strengths: string[]
- weaknesses: string[]
- missingSkills: string[]
- suggestedSkills: string[]
- recommendedCertifications: string[]
- recommendedProjects: array of { name, description, technologies: string[], rationale? }
- skillsScore: number 0-100 | null
- experienceScore: number 0-100 | null
- educationScore: number 0-100 | null
- keywordMatches: string[] (strong keywords already present)

Be specific, constructive, and realistic. Do not invent experience that is not supported by the resume.`;

export async function analyzeResumeWithAI(
  resumeText: string,
  parsedData: ParsedResumeData,
): Promise<ResumeAnalysisResult> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RESUME_ANALYSIS_PROMPT },
      {
        role: "user",
        content: `Structured profile:\n${JSON.stringify(parsedData, null, 2)}\n\nResume text:\n${resumeText.slice(0, 10000)}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI resume analysis returned an empty response.");
  }

  const json = JSON.parse(content) as unknown;
  const parsed = resumeAnalysisResultSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("AI resume analysis returned invalid structured data.");
  }

  return parsed.data;
}

export function analyzeResumeWithHeuristics(
  parsedData: ParsedResumeData,
): ResumeAnalysisResult {
  const skillCount = parsedData.skills.length + parsedData.technologies.length;
  const hasContact = Boolean(
    parsedData.name && (parsedData.email || parsedData.phone),
  );
  const hasExperience = parsedData.experience.length > 0;
  const hasEducation = parsedData.education.length > 0;
  const hasProjects = parsedData.projects.length > 0;

  let atsScore = 40;
  if (hasContact) atsScore += 15;
  if (hasExperience) atsScore += 15;
  if (hasEducation) atsScore += 10;
  if (skillCount >= 5) atsScore += 10;
  if (parsedData.certifications.length > 0) atsScore += 10;

  let resumeScore = atsScore;
  if (hasProjects) resumeScore += 5;
  if (skillCount >= 8) resumeScore += 5;

  atsScore = Math.min(100, atsScore);
  resumeScore = Math.min(100, resumeScore);

  const name = parsedData.name ?? "This candidate";
  const topSkills = [...parsedData.skills, ...parsedData.technologies].slice(
    0,
    5,
  );

  return resumeAnalysisResultSchema.parse({
    atsScore,
    resumeScore,
    professionalSummary: `${name} presents a resume with ${hasExperience ? "documented professional experience" : "limited experience detail"} and ${skillCount > 0 ? `skills including ${topSkills.join(", ")}` : "few listed skills"}.`,
    strengths: [
      ...(hasContact ? ["Contact information is present"] : []),
      ...(hasExperience ? ["Work experience section included"] : []),
      ...(skillCount > 0 ? ["Technical skills are listed"] : []),
    ],
    weaknesses: [
      ...(!hasProjects ? ["No projects section detected"] : []),
      ...(skillCount < 5 ? ["Skill section could be expanded"] : []),
      ...(!parsedData.phone ? ["Phone number not found"] : []),
    ],
    missingSkills: skillCount < 8 ? ["Git", "CI/CD", "Cloud platforms"] : [],
    suggestedSkills: [
      "Communication",
      "Problem solving",
      "Agile methodologies",
    ],
    recommendedCertifications: parsedData.certifications.length
      ? []
      : ["Industry-relevant professional certification"],
    recommendedProjects: hasProjects
      ? []
      : [
          {
            name: "Portfolio Project",
            description:
              "Build a full-stack application showcasing your core skills with deployment and documentation.",
            technologies: topSkills.length
              ? topSkills
              : ["TypeScript", "React"],
            rationale: "Demonstrates practical ability to hiring managers.",
          },
        ],
    skillsScore: skillCount >= 5 ? 70 : 45,
    experienceScore: hasExperience ? 72 : 40,
    educationScore: hasEducation ? 68 : 35,
    keywordMatches: topSkills,
  });
}
