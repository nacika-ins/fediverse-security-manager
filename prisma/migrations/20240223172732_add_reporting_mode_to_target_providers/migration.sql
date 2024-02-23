-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TargetProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "providerType" TEXT NOT NULL,
    "apiEndpoint" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "adminApiToken" TEXT NOT NULL,
    "isReportOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TargetProvider" ("adminApiToken", "apiEndpoint", "apiToken", "createdAt", "enabled", "id", "name", "providerType", "updatedAt") SELECT "adminApiToken", "apiEndpoint", "apiToken", "createdAt", "enabled", "id", "name", "providerType", "updatedAt" FROM "TargetProvider";
DROP TABLE "TargetProvider";
ALTER TABLE "new_TargetProvider" RENAME TO "TargetProvider";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
