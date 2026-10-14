import type { CompleteOnboardingDraft } from '../entities/onboarding.entity.js';

export abstract class OnboardingFeedPort {
    abstract createFromOnboarding(input: {
        userId: string;
        onboardingId: string;
        draft: CompleteOnboardingDraft;
    }): Promise<{ feedId: string }>;
    abstract findFeedId(userId: string, onboardingId: string): Promise<string | null>;
}
