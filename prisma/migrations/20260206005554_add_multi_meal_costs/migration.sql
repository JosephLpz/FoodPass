/*
  Warnings:

  - You are about to drop the column `costPerMeal` on the `companies` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "MealType" ADD VALUE 'colacion';

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "costPerMeal",
ADD COLUMN     "costBreakfast" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "costDinner" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "costEnhanced" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "costLunch" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "costSnack" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "consumptions" ADD COLUMN     "costAtTime" DECIMAL(10,2) NOT NULL DEFAULT 0;
