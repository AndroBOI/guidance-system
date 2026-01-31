/*
  Warnings:

  - You are about to drop the column `department` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "department",
DROP COLUMN "year";
