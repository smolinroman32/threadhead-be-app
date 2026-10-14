import { Injectable } from '@nestjs/common';
import type { SaveOnboardingStepInput } from '../domain/entities/onboarding.entity.js';
import { CompleteOnboardingUseCase } from './use-cases/complete-onboarding.use-case.js';
import { GetOnboardingUseCase } from './use-cases/get-onboarding.use-case.js';
import { SaveOnboardingStepUseCase } from './use-cases/save-onboarding-step.use-case.js';

@Injectable()
export class OnboardingService {
    constructor(
        private readonly getUseCase: GetOnboardingUseCase,
        private readonly saveStepUseCase: SaveOnboardingStepUseCase,
        private readonly completeUseCase: CompleteOnboardingUseCase,
    ) {}

    get(userId: string) {
        return this.getUseCase.execute(userId);
    }

    saveStep(userId: string, input: SaveOnboardingStepInput) {
        return this.saveStepUseCase.execute(userId, input);
    }

    complete(userId: string, version: number) {
        return this.completeUseCase.execute(userId, version);
    }
}
