import { Injectable } from '@nestjs/common';
import { OnboardingEntity, type SaveOnboardingStepInput } from '../../domain/entities/onboarding.entity.js';
import { OnboardingRepositoryPort } from '../../domain/ports/onboarding-repository.port.js';

@Injectable()
export class SaveOnboardingStepUseCase {
    constructor(private readonly repository: OnboardingRepositoryPort) {}

    async execute(userId: string, input: SaveOnboardingStepInput) {
        const current = (await this.repository.findByUserId(userId)) ?? OnboardingEntity.initial(userId);
        const next = current.saveStep(input);

        await this.repository.save(next, current.version);

        return next;
    }
}
