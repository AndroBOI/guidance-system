/*
  Warnings:

  - Added the required column `time` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `date` on the `Appointment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "time" VARCHAR(20) NOT NULL,
DROP COLUMN "date",
ADD COLUMN     "date" VARCHAR(20) NOT NULL;
