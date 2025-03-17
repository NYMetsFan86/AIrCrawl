/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CrawlRun` table. All the data in the column will be lost.
  - You are about to drop the column `results` on the `CrawlRun` table. All the data in the column will be lost.
  - Made the column `startedAt` on table `CrawlRun` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "localPath" TEXT,
    "mimeType" TEXT,
    "alt" TEXT,
    "filename" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "crawlRunId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaAsset_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "CrawlRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CrawlRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "configuration" TEXT,
    "crawlJobId" TEXT NOT NULL,
    CONSTRAINT "CrawlRun_crawlJobId_fkey" FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CrawlRun" ("completedAt", "crawlJobId", "id", "startedAt", "status") SELECT "completedAt", "crawlJobId", "id", "startedAt", "status" FROM "CrawlRun";
DROP TABLE "CrawlRun";
ALTER TABLE "new_CrawlRun" RENAME TO "CrawlRun";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MediaAsset_crawlRunId_idx" ON "MediaAsset"("crawlRunId");

-- CreateIndex
CREATE INDEX "MediaAsset_status_idx" ON "MediaAsset"("status");
