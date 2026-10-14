-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('INTENT', 'PREFERENCES', 'REVIEW');

-- AlterTable
ALTER TABLE "Onboarding" DROP COLUMN "currentStep",
ADD COLUMN     "currentStep" "OnboardingStep" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OnboardingStatus" NOT NULL;

