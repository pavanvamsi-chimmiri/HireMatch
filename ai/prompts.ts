export const PROMPTS = {
  matchCandidate: (jobDescription: string, resume: string) =>
    `You are an expert recruiter AI. Score how well this candidate matches the job (0-100) and provide a brief summary.

Job Description:
${jobDescription}

Candidate Resume:
${resume}

Respond in JSON format: { "score": number, "summary": string, "strengths": string[], "gaps": string[] }`,

  summarizeResume: (resume: string) =>
    `Summarize this resume in 2-3 sentences highlighting key skills and experience:\n\n${resume}`,

  generateJobDescription: (title: string, requirements: string) =>
    `Write a compelling job description for the role "${title}" with these requirements:\n${requirements}`,
} as const;
