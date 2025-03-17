-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CrawlJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "schedule" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "useGlobalMedia" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CrawlJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CrawlJob" ("createdAt", "id", "isRecurring", "name", "schedule", "updatedAt", "url", "userId") SELECT "createdAt", "id", "isRecurring", "name", "schedule", "updatedAt", "url", "userId" FROM "CrawlJob";
DROP TABLE "CrawlJob";
ALTER TABLE "new_CrawlJob" RENAME TO "CrawlJob";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
