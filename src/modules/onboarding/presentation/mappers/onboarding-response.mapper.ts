import type { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
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
}
