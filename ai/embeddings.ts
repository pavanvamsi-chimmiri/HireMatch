import { getOpenAIClient } from "@/ai/client";

export const EMBEDDING_MODEL = "text-embedding-3-small" as const;

export async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const input = text.slice(0, 8000);

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
  });

  return response.data[0]?.embedding ?? [];
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getOpenAIClient();
  const input = texts.map((text) => text.slice(0, 8000));

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function keywordSimilarity(
  keywords: string[],
  document: string,
): number {
  if (keywords.length === 0) return 0;

  const doc = document.toLowerCase();
  const matches = keywords.filter((keyword) =>
    doc.includes(keyword.toLowerCase()),
  );

  return matches.length / keywords.length;
}
