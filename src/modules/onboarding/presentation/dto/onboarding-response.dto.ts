import type {
    OnboardingDraft,
    OnboardingStatus,
    OnboardingStep,
} from '../../domain/entities/onboarding.entity.js';

export class OnboardingResponseDto {
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    version: number;
    draft: OnboardingDraft;
}
