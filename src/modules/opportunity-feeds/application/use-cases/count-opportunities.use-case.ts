import { Injectable } from '@nestjs/common';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { OpportunityRepositoryPort } from '../../domain/ports/opportunity-repository.port.js';
import { readFilterFor } from '../opportunity-read-filter.js';

@Injectable()
export class CountOpportunitiesUseCase {
    constructor(
        private readonly feeds: OpportunityFeedRepositoryPort,
        private readonly opportunities: OpportunityRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
    ) {}

    async execute(userId: string, feedId: string) {
        const feed = await this.feeds.findByIdForUser(feedId, userId);

        if (!feed) throw new OpportunityFeedNotFoundError();

        const [newCount, saved, dismissed] = await Promise.all([
            this.opportunities.count(
                feedId,
                'NEW',
                await readFilterFor(this.socialAccounts, userId, feed, 'NEW'),
            ),
            this.opportunities.count(feedId, 'SAVED', null),
            this.opportunities.count(feedId, 'DISMISSED', null),
        ]);

        return { new: newCount, saved, dismissed };
    }
}
