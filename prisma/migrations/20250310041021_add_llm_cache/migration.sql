-- CreateTable
CREATE TABLE "LLMCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cacheKey" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "LLMCache_cacheKey_key" ON "LLMCache"("cacheKey");

-- CreateIndex
CREATE INDEX "LLMCache_cacheKey_idx" ON "LLMCache"("cacheKey");
