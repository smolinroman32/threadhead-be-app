import { Module } from '@nestjs/common';
import { OnboardingService } from './application/onboarding.service.js';
import { GetOnboardingUseCase } from './application/use-cases/get-onboarding.use-case.js';
import { SaveOnboardingStepUseCase } from './application/use-cases/save-onboarding-step.use-case.js';
import { OnboardingRepositoryPort } from './domain/ports/onboarding-repository.port.js';
import { OnboardingRepository } from './infrastructure/repositories/onboarding.repository.js';
import { OnboardingController } from './presentation/onboarding.controller.js';

@Module({
    controllers: [OnboardingController],
    providers: [
        { provide: OnboardingRepositoryPort, useClass: OnboardingRepository },
        GetOnboardingUseCase,
        SaveOnboardingStepUseCase,
        OnboardingService,
    ],
    exports: [OnboardingService],
})
export class OnboardingModule {}
