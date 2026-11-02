-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "authorDisplayName" TEXT,
ADD COLUMN     "likeCount" INTEGER,
ADD COLUMN     "metricsFetchedAt" TIMESTAMP(3),
ADD COLUMN     "replyCount" INTEGER,
ADD COLUMN     "repostCount" INTEGER;
