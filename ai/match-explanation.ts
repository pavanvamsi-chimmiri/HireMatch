import { DEFAULT_MODEL, getOpenAIClient } from "@/ai/client";
import type { CandidateMatchFactors } from "@/types/candidate-match";

export async function generateMatchExplanation(input: {
  jobTitle: string;
  candidateName: string | null;
  factors: CandidateMatchFactors;
  matchedSkills: string[];
  gaps: string[];
}): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You are an expert recruiter. Write a concise 2-3 sentence explanation of why a candidate matches a job. Be specific and balanced.",
      },
      {
        role: "user",
        content: JSON.stringify(input, null, 2),
      },
    ],
  });

  return (
    response.choices[0]?.message?.content?.trim() ??
    buildFallbackExplanation(input)
  );
}

export function buildFallbackExplanation(input: {
  candidateName: string | null;
  factors: CandidateMatchFactors;
  matchedSkills: string[];
}): string {
  const name = input.candidateName ?? "This candidate";
  const skills =
    input.matchedSkills.length > 0
      ? ` including ${input.matchedSkills.slice(0, 4).join(", ")}`
      : "";

  return `${name} is a ${input.factors.overallMatch}% overall match with ${input.factors.skillMatch}% skill alignment${skills}, ${input.factors.experienceMatch}% experience fit, and ${input.factors.atsMatch}% ATS compatibility.`;
}
