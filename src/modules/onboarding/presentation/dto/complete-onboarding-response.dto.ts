import { OnboardingResponseDto } from './onboarding-response.dto.js';

export class CompleteOnboardingResponseDto extends OnboardingResponseDto {
    feedId: string | null;
}
