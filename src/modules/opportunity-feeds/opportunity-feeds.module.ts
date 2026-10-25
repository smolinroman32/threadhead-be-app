import { Module } from '@nestjs/common';
import { LlmModule } from '../../shared/llm/llm.module.js';
import { QueueModule } from '../../shared/queue/queue.module.js';
import { SocialAccountsModule } from '../social-accounts/social-accounts.module.js';
import { OpportunityFeedsService } from './application/opportunity-feeds.service.js';
import { CreateFeedFromOnboardingUseCase } from './application/use-cases/create-feed-from-onboarding.use-case.js';
import { CreateOpportunityFeedUseCase } from './application/use-cases/create-opportunity-feed.use-case.js';
import { DeleteOpportunityFeedUseCase } from './application/use-cases/delete-opportunity-feed.use-case.js';
import { FindFeedByOnboardingUseCase } from './application/use-cases/find-feed-by-onboarding.use-case.js';
import { GetOpportunityFeedUseCase } from './application/use-cases/get-opportunity-feed.use-case.js';
import { ListOpportunityFeedsUseCase } from './application/use-cases/list-opportunity-feeds.use-case.js';
import { UpdateOpportunityFeedUseCase } from './application/use-cases/update-opportunity-feed.use-case.js';
import { QueueDiscoveryRunUseCase } from './application/use-cases/queue-discovery-run.use-case.js';
import { ReconcileDiscoveryRunsUseCase } from './application/use-cases/reconcile-discovery-runs.use-case.js';
import { RunDiscoveryUseCase } from './application/use-cases/run-discovery.use-case.js';
import { DiscoveryQueuePort } from './domain/ports/discovery-queue.port.js';
import { DiscoveryRunRepositoryPort } from './domain/ports/discovery-run-repository.port.js';
import { DiscoveryWorkPort } from './domain/ports/discovery-work.port.js';
import { BullDiscoveryQueue } from './infrastructure/queue/bull-discovery-queue.js';
import { DiscoveryWorker } from './infrastructure/queue/discovery.worker.js';
import { DiscoveryWorkRepository } from './infrastructure/repositories/discovery-work.repository.js';
import { OpportunityFeedRepositoryPort } from './domain/ports/opportunity-feed-repository.port.js';
import { DiscoveryRunRepository } from './infrastructure/repositories/discovery-run.repository.js';
import { OpportunityFeedRepository } from './infrastructure/repositories/opportunity-feed.repository.js';
import { ChangeOpportunityStatusUseCase } from './application/use-cases/change-opportunity-status.use-case.js';
import { CountOpportunitiesUseCase } from './application/use-cases/count-opportunities.use-case.js';
import { GetDiscoveryRunUseCase } from './application/use-cases/get-discovery-run.use-case.js';
import { ListOpportunitiesUseCase } from './application/use-cases/list-opportunities.use-case.js';
import { RequestDiscoveryRunUseCase } from './application/use-cases/request-discovery-run.use-case.js';
import { OpportunityRepositoryPort } from './domain/ports/opportunity-repository.port.js';
import { OpportunityRepository } from './infrastructure/repositories/opportunity.repository.js';
import { DiscoveryController } from './presentation/discovery.controller.js';
import { OpportunityFeedsController } from './presentation/opportunity-feeds.controller.js';

@Module({
    imports: [SocialAccountsModule, LlmModule, QueueModule],
    controllers: [OpportunityFeedsController, DiscoveryController],
    providers: [
        { provide: OpportunityFeedRepositoryPort, useClass: OpportunityFeedRepository },
        { provide: DiscoveryRunRepositoryPort, useClass: DiscoveryRunRepository },
        { provide: DiscoveryWorkPort, useClass: DiscoveryWorkRepository },
        { provide: OpportunityRepositoryPort, useClass: OpportunityRepository },
        RequestDiscoveryRunUseCase,
        GetDiscoveryRunUseCase,
        ListOpportunitiesUseCase,
        CountOpportunitiesUseCase,
        ChangeOpportunityStatusUseCase,
        BullDiscoveryQueue,
        { provide: DiscoveryQueuePort, useExisting: BullDiscoveryQueue },
        QueueDiscoveryRunUseCase,
        RunDiscoveryUseCase,
        ReconcileDiscoveryRunsUseCase,
        DiscoveryWorker,
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
