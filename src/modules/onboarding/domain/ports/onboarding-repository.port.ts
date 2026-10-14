import type { OnboardingEntity } from '../entities/onboarding.entity.js';

export abstract class OnboardingRepositoryPort {
    abstract findByUserId(userId: string): Promise<OnboardingEntity | null>;
    abstract save(onboarding: OnboardingEntity, expectedVersion: number): Promise<void>;
}
