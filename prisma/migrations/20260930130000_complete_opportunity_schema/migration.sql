BEGIN;

-- Rename the social account model to match the Threads integration.
ALTER TABLE "SocialAccount" RENAME TO "ThreadsAccount";
ALTER TABLE "ThreadsAccount"
  RENAME CONSTRAINT "SocialAccount_pkey" TO "ThreadsAccount_pkey";
ALTER TABLE "ThreadsAccount"
  RENAME CONSTRAINT "SocialAccount_userId_fkey" TO "ThreadsAccount_userId_fkey";

-- Complete the Threads account fields.
ALTER TABLE "ThreadsAccount"
  ADD COLUMN "threadsUserId" TEXT NOT NULL;
ALTER TABLE "ThreadsAccount"
  ALTER COLUMN "tokenExpiresAt" SET NOT NULL;

-- CreateEnum
CREATE TYPE "SearchQueryType" AS ENUM ('KEYWORD', 'PHRASE');

-- CreateTable
CREATE TABLE "OpportunityFeed" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "includeTerms" TEXT[] NOT NULL,
    "excludeTerms" TEXT[] NOT NULL,
    "languages" TEXT[] NOT NULL,
    "freshnessHours" INTEGER NOT NULL,
    "minScore" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpportunityFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" UUID NOT NULL,
    "opportunityFeedId" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "type" "SearchQueryType" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "matchedPosts" INTEGER NOT NULL,
    "relevantPosts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" UUID NOT NULL,
    "opportunityFeedId" UUID NOT NULL,
    "externalPostId" TEXT NOT NULL,
    "authorUsername" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunitySearchQuery" (
    "opportunityId" UUID NOT NULL,
    "searchQueryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunitySearchQuery_pkey" PRIMARY KEY ("opportunityId", "searchQueryId")
);

-- AddForeignKey
ALTER TABLE "OpportunityFeed"
  ADD CONSTRAINT "OpportunityFeed_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery"
  ADD CONSTRAINT "SearchQuery_opportunityFeedId_fkey"
  FOREIGN KEY ("opportunityFeedId") REFERENCES "OpportunityFeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity"
  ADD CONSTRAINT "Opportunity_opportunityFeedId_fkey"
  FOREIGN KEY ("opportunityFeedId") REFERENCES "OpportunityFeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunitySearchQuery"
  ADD CONSTRAINT "OpportunitySearchQuery_opportunityId_fkey"
  FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunitySearchQuery"
  ADD CONSTRAINT "OpportunitySearchQuery_searchQueryId_fkey"
  FOREIGN KEY ("searchQueryId") REFERENCES "SearchQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
