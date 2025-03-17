/*
  Warnings:

  - The primary key for the `LLMCache` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `LLMCache` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Made the column `expiresAt` on table `LLMCache` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LLMCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cacheKey" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL
);
INSERT INTO "new_LLMCache" ("cacheKey", "createdAt", "expiresAt", "id", "model", "prompt", "provider", "response", "updatedAt") SELECT "cacheKey", "createdAt", "expiresAt", "id", "model", "prompt", "provider", "response", "updatedAt" FROM "LLMCache";
DROP TABLE "LLMCache";
ALTER TABLE "new_LLMCache" RENAME TO "LLMCache";
CREATE UNIQUE INDEX "LLMCache_cacheKey_key" ON "LLMCache"("cacheKey");
CREATE INDEX "LLMCache_cacheKey_idx" ON "LLMCache"("cacheKey");
CREATE INDEX "LLMCache_expiresAt_idx" ON "LLMCache"("expiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
