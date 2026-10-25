import { Injectable } from '@nestjs/common';
import {
    FEED_LANGUAGES,
    MAX_FEEDS_PER_USER,
    buildFeedFields,
    type NewOpportunityFeedInput,
} from '../../domain/entities/opportunity-feed-fields.js';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { accountForNewFeed } from '../feed-account.js';
import { QueueDiscoveryRunUseCase } from './queue-discovery-run.use-case.js';

@Injectable()
export class CreateOpportunityFeedUseCase {
    constructor(
        private readonly repository: OpportunityFeedRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
        private readonly discovery: QueueDiscoveryRunUseCase,
    ) {}

    async execute(userId: string, input: NewOpportunityFeedInput) {
        const fields = buildFeedFields(input);
        const socialAccountId = await accountForNewFeed(this.socialAccounts, userId, input.socialAccountId);

        const feed = await this.repository.createWithinLimit(
            { ...fields, userId, onboardingId: null, socialAccountId, languages: [...FEED_LANGUAGES] },
            MAX_FEEDS_PER_USER,
        );

        await this.discovery.afterChange(feed.id, { criteriaChanged: true, resumed: false });

        return feed;
    }
}
