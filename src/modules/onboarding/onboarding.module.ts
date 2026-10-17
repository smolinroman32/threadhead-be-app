import { Module } from '@nestjs/common';
import { OpportunityFeedsModule } from '../opportunity-feeds/opportunity-feeds.module.js';
import { OnboardingService } from './application/onboarding.service.js';
import { CompleteOnboardingUseCase } from './application/use-cases/complete-onboarding.use-case.js';
import { GetOnboardingUseCase } from './application/use-cases/get-onboarding.use-case.js';
import { SaveOnboardingStepUseCase } from './application/use-cases/save-onboarding-step.use-case.js';
import { OnboardingFeedPort } from './domain/ports/onboarding-feed.port.js';
import { OnboardingRepositoryPort } from './domain/ports/onboarding-repository.port.js';
import { OnboardingFeedAdapter } from './infrastructure/feeds/onboarding-feed.adapter.js';
import { OnboardingRepository } from './infrastructure/repositories/onboarding.repository.js';
import { OnboardingController } from './presentation/onboarding.controller.js';

@Module({
    imports: [OpportunityFeedsModule],
    controllers: [OnboardingController],
    providers: [
        { provide: OnboardingRepositoryPort, useClass: OnboardingRepository },
        { provide: OnboardingFeedPort, useClass: OnboardingFeedAdapter },
        GetOnboardingUseCase,
        SaveOnboardingStepUseCase,
        CompleteOnboardingUseCase,
        OnboardingService,
    ],
    exports: [OnboardingService],
})
export class OnboardingModule {}
