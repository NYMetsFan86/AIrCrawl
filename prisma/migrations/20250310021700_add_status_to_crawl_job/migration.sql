/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CrawlJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "schedule" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "useGlobalMedia" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CrawlJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CrawlJob" ("createdAt", "id", "isRecurring", "name", "schedule", "updatedAt", "url", "useGlobalMedia", "userId") SELECT "createdAt", "id", "isRecurring", "name", "schedule", "updatedAt", "url", "useGlobalMedia", "userId" FROM "CrawlJob";
DROP TABLE "CrawlJob";
ALTER TABLE "new_CrawlJob" RENAME TO "CrawlJob";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "hashedPassword" TEXT,
    "reset_password_expires" DATETIME,
    "reset_password_token" TEXT,
    "provider" TEXT,
    "providerAccountId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("email", "emailVerified", "hashedPassword", "id", "image", "name", "reset_password_expires", "reset_password_token", "role") SELECT "email", "emailVerified", "hashedPassword", "id", "image", "name", "reset_password_expires", "reset_password_token", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
