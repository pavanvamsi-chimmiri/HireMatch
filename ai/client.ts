import OpenAI from "openai";
import { serverEnv } from "@/lib/env";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!serverEnv.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: serverEnv.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

export const DEFAULT_MODEL = "gpt-4o-mini" as const;
