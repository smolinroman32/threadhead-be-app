import { Module } from '@nestjs/common';
import { SocialAccountsModule } from '../social-accounts/social-accounts.module.js';
import { OpportunityFeedsService } from './application/opportunity-feeds.service.js';
import { CreateFeedFromOnboardingUseCase } from './application/use-cases/create-feed-from-onboarding.use-case.js';
import { CreateOpportunityFeedUseCase } from './application/use-cases/create-opportunity-feed.use-case.js';
import { DeleteOpportunityFeedUseCase } from './application/use-cases/delete-opportunity-feed.use-case.js';
import { FindFeedByOnboardingUseCase } from './application/use-cases/find-feed-by-onboarding.use-case.js';
import { GetOpportunityFeedUseCase } from './application/use-cases/get-opportunity-feed.use-case.js';
import { ListOpportunityFeedsUseCase } from './application/use-cases/list-opportunity-feeds.use-case.js';
import { UpdateOpportunityFeedUseCase } from './application/use-cases/update-opportunity-feed.use-case.js';
import { DiscoveryRunRepositoryPort } from './domain/ports/discovery-run-repository.port.js';
import { OpportunityFeedRepositoryPort } from './domain/ports/opportunity-feed-repository.port.js';
import { DiscoveryRunRepository } from './infrastructure/repositories/discovery-run.repository.js';
import { OpportunityFeedRepository } from './infrastructure/repositories/opportunity-feed.repository.js';
import { OpportunityFeedsController } from './presentation/opportunity-feeds.controller.js';

@Module({
    imports: [SocialAccountsModule],
    controllers: [OpportunityFeedsController],
    providers: [
        { provide: OpportunityFeedRepositoryPort, useClass: OpportunityFeedRepository },
        { provide: DiscoveryRunRepositoryPort, useClass: DiscoveryRunRepository },
        CreateOpportunityFeedUseCase,
        CreateFeedFromOnboardingUseCase,
        ListOpportunityFeedsUseCase,
        GetOpportunityFeedUseCase,
        UpdateOpportunityFeedUseCase,
        DeleteOpportunityFeedUseCase,
        FindFeedByOnboardingUseCase,
        OpportunityFeedsService,
    ],
    exports: [OpportunityFeedsService],
})
export class OpportunityFeedsModule {}
