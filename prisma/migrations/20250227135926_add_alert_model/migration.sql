-- AlterTable
ALTER TABLE "User" ADD COLUMN "hashedPassword" TEXT;
ALTER TABLE "User" ADD COLUMN "reset_password_expires" DATETIME;
ALTER TABLE "User" ADD COLUMN "reset_password_token" TEXT;

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT,
    "confidence" REAL,
    "matchedContent" TEXT,
    "userId" TEXT NOT NULL,
    "crawlJobId" TEXT,
    "crawlRunId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Alert_crawlJobId_fkey" FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Alert_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "CrawlRun" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
