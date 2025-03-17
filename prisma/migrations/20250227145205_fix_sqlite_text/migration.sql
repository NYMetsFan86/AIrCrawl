/*
  Warnings:

  - You are about to drop the `CrawlAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CrawlAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CrawlAlert";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CrawlAnalysis";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "crawl_analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crawlJobId" TEXT NOT NULL,
    "analysisResult" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL,
    CONSTRAINT "crawl_analysis_crawlJobId_fkey" FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "crawl_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crawlId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL
);
