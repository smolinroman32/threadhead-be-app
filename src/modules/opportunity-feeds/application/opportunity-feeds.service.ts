import { Injectable } from '@nestjs/common';
import type {
    NewOpportunityFeedInput,
    OpportunityFeedChanges,
} from '../domain/entities/opportunity-feed-fields.js';
import type { OpportunityStatus, ReviewStatus } from '../domain/entities/opportunity.entity.js';
import { ChangeOpportunityStatusUseCase } from './use-cases/change-opportunity-status.use-case.js';
import { CountOpportunitiesUseCase } from './use-cases/count-opportunities.use-case.js';
import {
    CreateFeedFromOnboardingUseCase,
    type CreateFeedFromOnboardingInput,
} from './use-cases/create-feed-from-onboarding.use-case.js';
import { CreateOpportunityFeedUseCase } from './use-cases/create-opportunity-feed.use-case.js';
import { DeleteOpportunityFeedUseCase } from './use-cases/delete-opportunity-feed.use-case.js';
import { FindFeedByOnboardingUseCase } from './use-cases/find-feed-by-onboarding.use-case.js';
import { GetDiscoveryRunUseCase } from './use-cases/get-discovery-run.use-case.js';
import { GetOpportunityFeedUseCase } from './use-cases/get-opportunity-feed.use-case.js';
import { ListOpportunitiesUseCase } from './use-cases/list-opportunities.use-case.js';
import { ListOpportunityFeedsUseCase } from './use-cases/list-opportunity-feeds.use-case.js';
import { RequestDiscoveryRunUseCase } from './use-cases/request-discovery-run.use-case.js';
import { UpdateOpportunityFeedUseCase } from './use-cases/update-opportunity-feed.use-case.js';

@Injectable()
export class OpportunityFeedsService {
    constructor(
        private readonly createUseCase: CreateOpportunityFeedUseCase,
        private readonly createFromOnboardingUseCase: CreateFeedFromOnboardingUseCase,
        private readonly listUseCase: ListOpportunityFeedsUseCase,
        private readonly getUseCase: GetOpportunityFeedUseCase,
        private readonly updateUseCase: UpdateOpportunityFeedUseCase,
        private readonly deleteUseCase: DeleteOpportunityFeedUseCase,
        private readonly findByOnboardingUseCase: FindFeedByOnboardingUseCase,
        private readonly requestRunUseCase: RequestDiscoveryRunUseCase,
        private readonly getRunUseCase: GetDiscoveryRunUseCase,
        private readonly listOpportunitiesUseCase: ListOpportunitiesUseCase,
        private readonly countOpportunitiesUseCase: CountOpportunitiesUseCase,
        private readonly changeOpportunityStatusUseCase: ChangeOpportunityStatusUseCase,
    ) {}

    create(userId: string, input: NewOpportunityFeedInput) {
        return this.createUseCase.execute(userId, input);
    }

    createFromOnboarding(input: CreateFeedFromOnboardingInput) {
        return this.createFromOnboardingUseCase.execute(input);
    }

    list(userId: string) {
        return this.listUseCase.execute(userId);
    }

    get(userId: string, id: string) {
        return this.getUseCase.execute(userId, id);
    }

    update(userId: string, id: string, changes: OpportunityFeedChanges) {
        return this.updateUseCase.execute(userId, id, changes);
    }

    delete(userId: string, id: string) {
        return this.deleteUseCase.execute(userId, id);
    }

    findByOnboardingId(userId: string, onboardingId: string) {
        return this.findByOnboardingUseCase.execute(userId, onboardingId);
    }

    requestRun(userId: string, feedId: string) {
        return this.requestRunUseCase.execute(userId, feedId);
    }

    getRun(userId: string, feedId: string, runId: string | 'latest') {
        return this.getRunUseCase.execute(userId, feedId, runId);
    }

    listOpportunities(userId: string, feedId: string, status: OpportunityStatus, page: number) {
        return this.listOpportunitiesUseCase.execute(userId, feedId, status, page);
    }

    countOpportunities(userId: string, feedId: string) {
        return this.countOpportunitiesUseCase.execute(userId, feedId);
    }

    changeOpportunityStatus(userId: string, id: string, status: ReviewStatus) {
        return this.changeOpportunityStatusUseCase.execute(userId, id, status);
    }
}
