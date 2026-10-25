-- AlterTable
ALTER TABLE "OpportunityFeed" ADD COLUMN     "onboardingId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityFeed_onboardingId_key" ON "OpportunityFeed"("onboardingId");

