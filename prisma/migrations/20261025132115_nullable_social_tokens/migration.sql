-- AlterTable
ALTER TABLE "SocialAccount" ALTER COLUMN "accessTokenEncrypted" DROP NOT NULL,
ALTER COLUMN "tokenExpiresAt" DROP NOT NULL;
