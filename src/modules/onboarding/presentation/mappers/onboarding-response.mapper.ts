import type { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import type { CompleteOnboardingResponseDto } from '../dto/complete-onboarding-response.dto.js';
import type { OnboardingResponseDto } from '../dto/onboarding-response.dto.js';

export class OnboardingResponseMapper {
    static toDto(onboarding: OnboardingEntity): OnboardingResponseDto {
        return {
            currentStep: onboarding.currentStep,
            status: onboarding.status,
            version: onboarding.version,
            draft: onboarding.draft,
        };
    }

    static toCompleteDto(onboarding: OnboardingEntity, feedId: string | null): CompleteOnboardingResponseDto {
        return { ...OnboardingResponseMapper.toDto(onboarding), feedId };
    }
}
