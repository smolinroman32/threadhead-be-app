import { Injectable } from '@nestjs/common';
import {
    FEED_LANGUAGES,
    MAX_FEEDS_PER_USER,
    buildFeedFields,
    feedNameFromIntent,
} from '../../domain/entities/opportunity-feed-fields.js';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { accountForNewFeed } from '../feed-account.js';
import { QueueDiscoveryRunUseCase } from './queue-discovery-run.use-case.js';

export type CreateFeedFromOnboardingInput = {
    userId: string;
    onboardingId: string;
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
    color?: string;
};

@Injectable()
export class CreateFeedFromOnboardingUseCase {
    constructor(
        private readonly repository: OpportunityFeedRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
        private readonly discovery: QueueDiscoveryRunUseCase,
    ) {}

    async execute(input: CreateFeedFromOnboardingInput) {
        const fields = buildFeedFields({
            name: feedNameFromIntent(input.intent),
            description: input.intent,
            color: input.color,
            intent: input.intent,
            targetAudience: input.targetAudience,
            includeTerms: input.includeTerms,
            excludeTerms: input.excludeTerms,
        });

        const socialAccountId = await accountForNewFeed(this.socialAccounts, input.userId, undefined);

        const feed = await this.repository.createWithinLimit(
            {
                ...fields,
                userId: input.userId,
                onboardingId: input.onboardingId,
                socialAccountId,
                languages: [...FEED_LANGUAGES],
            },
            MAX_FEEDS_PER_USER,
        );

        await this.discovery.afterChange(feed.id, { criteriaChanged: true, resumed: false });

        return feed;
    }
}
