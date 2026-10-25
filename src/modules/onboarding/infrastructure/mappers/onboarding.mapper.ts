import type { Onboarding } from '../../../../generated/prisma/client.js';
import { OnboardingEntity, type OnboardingDraft } from '../../domain/entities/onboarding.entity.js';

export class OnboardingMapper {
    static toDomain(raw: Onboarding): OnboardingEntity {
        return new OnboardingEntity({
            id: raw.id,
            userId: raw.userId,
            currentStep: raw.currentStep,
            status: raw.status,
            draft: raw.draft as OnboardingDraft,
            version: raw.version,
            completedAt: raw.completedAt,
        });
    }
}
