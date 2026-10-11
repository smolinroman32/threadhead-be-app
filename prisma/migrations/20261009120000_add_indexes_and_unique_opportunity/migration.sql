-- AlterTable
ALTER TABLE "OpportunityFeed" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "SearchQuery" ALTER COLUMN "isActive" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "OpportunityFeed_userId_idx" ON "OpportunityFeed"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_opportunityFeedId_externalPostId_key" ON "Opportunity"("opportunityFeedId", "externalPostId");

-- CreateIndex
CREATE INDEX "SearchQuery_opportunityFeedId_idx" ON "SearchQuery"("opportunityFeedId");

-- CreateIndex
CREATE INDEX "ThreadsAccount_userId_idx" ON "ThreadsAccount"("userId");

