/*
  Warnings:

  - Added the required column `targetAudience` to the `OpportunityFeed` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OpportunityFeed" ADD COLUMN     "targetAudience" TEXT NOT NULL;
