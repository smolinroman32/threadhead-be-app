/*
  Warnings:

  - You are about to drop the column `score` on the `Opportunity` table. All the data in the column will be lost.
  - Added the required column `relevanceScore` to the `Opportunity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoringVersion` to the `Opportunity` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Opportunity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DiscoveryRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('NEW', 'SAVED', 'DISMISSED', 'REPLIED');

-- CreateEnum
CREATE TYPE "SearchAccess" AS ENUM ('OK', 'NARROWED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "score",
ADD COLUMN     "excludedTerm" TEXT,
ADD COLUMN     "relevanceScore" INTEGER NOT NULL,
ADD COLUMN     "scoringVersion" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OpportunityStatus" NOT NULL;

-- AlterTable
ALTER TABLE "OpportunityFeed" ADD COLUMN     "scoringVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "socialAccountId" UUID;

-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "disconnectedAt" TIMESTAMP(3),
ADD COLUMN     "searchAccess" "SearchAccess",
ADD COLUMN     "searchAccessCheckedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DiscoveryRun" (
    "id" UUID NOT NULL,
    "opportunityFeedId" UUID NOT NULL,
    "status" "DiscoveryRunStatus" NOT NULL,
    "scoringVersion" INTEGER,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "heartbeatAt" TIMESTAMP(3),
    "notBefore" TIMESTAMP(3),
    "error" TEXT,
    "stats" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "DiscoveryRun_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiscoveryRun" ADD CONSTRAINT "DiscoveryRun_opportunityFeedId_fkey" FOREIGN KEY ("opportunityFeedId") REFERENCES "OpportunityFeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityFeed" ADD CONSTRAINT "OpportunityFeed_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
