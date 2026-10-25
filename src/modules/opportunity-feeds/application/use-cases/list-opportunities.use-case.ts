import { Injectable } from '@nestjs/common';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { OPPORTUNITY_LIST_LIMIT } from '../../domain/discovery/discovery.constants.js';
import type { OpportunityStatus } from '../../domain/entities/opportunity.entity.js';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { OpportunityRepositoryPort } from '../../domain/ports/opportunity-repository.port.js';

const HOUR_MS = 60 * 60_000;

@Injectable()
export class ListOpportunitiesUseCase {
    constructor(
        private readonly feeds: OpportunityFeedRepositoryPort,
        private readonly opportunities: OpportunityRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
    ) {}

    async execute(userId: string, feedId: string, status: OpportunityStatus) {
        const feed = await this.feeds.findByIdForUser(feedId, userId);

        if (!feed) throw new OpportunityFeedNotFoundError();

        const newOnly =
            status === 'NEW'
                ? {
                      minScore: feed.minScore,
                      publishedSince: new Date(Date.now() - feed.freshnessHours * HOUR_MS),
                      excludeAuthor: await this.accountUsername(userId, feed.socialAccountId),
                  }
                : null;

        return this.opportunities.list({
            feedId,
            status,
            newOnly,
            limit: OPPORTUNITY_LIST_LIMIT,
        });
    }

    private async accountUsername(userId: string, accountId: string | null) {
        if (!accountId) return null;

        const accounts = await this.socialAccounts.list(userId);

        return accounts.find((account) => account.id === accountId)?.username ?? null;
    }
}
