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

@Injectable()
export class CreateOpportunityFeedUseCase {
    constructor(
        private readonly repository: OpportunityFeedRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
    ) {}

    async execute(userId: string, input: NewOpportunityFeedInput) {
        const fields = buildFeedFields(input);
        const socialAccountId = await accountForNewFeed(this.socialAccounts, userId, input.socialAccountId);

        return this.repository.createWithinLimit(
            { ...fields, userId, onboardingId: null, socialAccountId, languages: [...FEED_LANGUAGES] },
            MAX_FEEDS_PER_USER,
        );
    }
}
