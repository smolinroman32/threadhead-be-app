BEGIN;

-- Generalize the Threads account into a provider-agnostic social account.
CREATE TYPE "SocialProvider" AS ENUM ('THREADS');

ALTER TABLE "ThreadsAccount" RENAME TO "SocialAccount";
ALTER TABLE "SocialAccount"
  RENAME CONSTRAINT "ThreadsAccount_pkey" TO "SocialAccount_pkey";
ALTER TABLE "SocialAccount"
  RENAME CONSTRAINT "ThreadsAccount_userId_fkey" TO "SocialAccount_userId_fkey";
ALTER INDEX "ThreadsAccount_userId_idx" RENAME TO "SocialAccount_userId_idx";

-- Existing rows are Threads accounts.
ALTER TABLE "SocialAccount" ADD COLUMN "provider" "SocialProvider" NOT NULL DEFAULT 'THREADS';
ALTER TABLE "SocialAccount" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "SocialAccount" RENAME COLUMN "threadsUserId" TO "providerAccountId";

ALTER TABLE "SocialAccount" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "SocialAccount" ADD COLUMN "refreshTokenEncrypted" TEXT;

-- One external account belongs to one user. Fails if duplicate threadsUserId values exist.
CREATE UNIQUE INDEX "SocialAccount_provider_providerAccountId_key"
  ON "SocialAccount"("provider", "providerAccountId");

COMMIT;
