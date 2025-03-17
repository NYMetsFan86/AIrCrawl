/*
  Warnings:

  - Added the required column `pageTitle` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUrl` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CrawlRun" ADD COLUMN "resultsData" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MediaAsset" (
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
    "type" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "pageTitle" TEXT NOT NULL,
    "metadata" TEXT,
    CONSTRAINT "MediaAsset_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "CrawlRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MediaAsset" ("alt", "crawlRunId", "createdAt", "filename", "height", "id", "localPath", "mimeType", "size", "status", "updatedAt", "url", "width") SELECT "alt", "crawlRunId", "createdAt", "filename", "height", "id", "localPath", "mimeType", "size", "status", "updatedAt", "url", "width" FROM "MediaAsset";
DROP TABLE "MediaAsset";
ALTER TABLE "new_MediaAsset" RENAME TO "MediaAsset";
CREATE INDEX "MediaAsset_crawlRunId_idx" ON "MediaAsset"("crawlRunId");
CREATE INDEX "MediaAsset_status_idx" ON "MediaAsset"("status");
CREATE TABLE "new_crawl_analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crawlJobId" TEXT NOT NULL,
    "analysisResult" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL,
    CONSTRAINT "crawl_analysis_crawlJobId_fkey" FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "crawl_analysis_crawlJobId_fkey" FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_crawl_analysis" ("analysisResult", "crawlJobId", "id", "processedAt") SELECT "analysisResult", "crawlJobId", "id", "processedAt" FROM "crawl_analysis";
DROP TABLE "crawl_analysis";
ALTER TABLE "new_crawl_analysis" RENAME TO "crawl_analysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
