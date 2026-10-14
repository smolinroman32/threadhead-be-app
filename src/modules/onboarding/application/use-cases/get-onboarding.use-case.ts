import { Injectable } from '@nestjs/common';
import { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import { OnboardingRepositoryPort } from '../../domain/ports/onboarding-repository.port.js';

@Injectable()
export class GetOnboardingUseCase {
    constructor(private readonly repository: OnboardingRepositoryPort) {}

    async execute(userId: string) {
        return (await this.repository.findByUserId(userId)) ?? OnboardingEntity.initial(userId);
    }
}
