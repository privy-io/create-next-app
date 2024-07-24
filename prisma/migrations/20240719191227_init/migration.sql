/*
  Warnings:

  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `event_id` on the `Event` table. All the data in the column will be lost.
  - The required column `eventId` was added to the `Event` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "chain" TEXT NOT NULL,
    "contractAddr" TEXT NOT NULL
);
INSERT INTO "new_Event" ("chain", "contractAddr") SELECT "chain", "contractAddr" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
