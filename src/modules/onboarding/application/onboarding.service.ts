import { Injectable } from '@nestjs/common';
import type { SaveOnboardingStepInput } from '../domain/entities/onboarding.entity.js';
import { GetOnboardingUseCase } from './use-cases/get-onboarding.use-case.js';
import { SaveOnboardingStepUseCase } from './use-cases/save-onboarding-step.use-case.js';

@Injectable()
export class OnboardingService {
    constructor(
        private readonly getUseCase: GetOnboardingUseCase,
        private readonly saveStepUseCase: SaveOnboardingStepUseCase,
    ) {}

    get(userId: string) {
        return this.getUseCase.execute(userId);
    }

    saveStep(userId: string, input: SaveOnboardingStepInput) {
        return this.saveStepUseCase.execute(userId, input);
    }
}
