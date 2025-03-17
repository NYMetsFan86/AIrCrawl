-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "hashedPassword" TEXT,
    "reset_password_expires" DATETIME,
    "reset_password_token" TEXT
);
INSERT INTO "new_User" ("email", "emailVerified", "hashedPassword", "id", "image", "name", "reset_password_expires", "reset_password_token") SELECT "email", "emailVerified", "hashedPassword", "id", "image", "name", "reset_password_expires", "reset_password_token" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
