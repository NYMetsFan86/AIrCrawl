-- CreateTable
CREATE TABLE "CrawlAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crawlJobId" TEXT NOT NULL,
    "analysisResult" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL,
    CONSTRAINT "CrawlAnalysis_crawlJobId_fkey" FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrawlAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crawlId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL
);
