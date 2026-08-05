-- Add vector embedding fields for semantic candidate search
ALTER TABLE "resumes"
ADD COLUMN IF NOT EXISTS "embedding" JSONB,
ADD COLUMN IF NOT EXISTS "facetEmbeddings" JSONB,
ADD COLUMN IF NOT EXISTS "embeddingModel" TEXT,
ADD COLUMN IF NOT EXISTS "embeddedAt" TIMESTAMP(3);
