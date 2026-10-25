import { Injectable } from '@nestjs/common';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { OPPORTUNITY_PAGE_SIZE } from '../../domain/discovery/discovery.constants.js';
import type { OpportunityStatus } from '../../domain/entities/opportunity.entity.js';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { OpportunityRepositoryPort } from '../../domain/ports/opportunity-repository.port.js';
import { readFilterFor } from '../opportunity-read-filter.js';

@Injectable()
export class ListOpportunitiesUseCase {
    constructor(
        private readonly feeds: OpportunityFeedRepositoryPort,
        private readonly opportunities: OpportunityRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
    ) {}

    async execute(userId: string, feedId: string, status: OpportunityStatus, page: number) {
        const feed = await this.feeds.findByIdForUser(feedId, userId);

        if (!feed) throw new OpportunityFeedNotFoundError();

        const { items, total } = await this.opportunities.list({
            feedId,
            status,
            newOnly: await readFilterFor(this.socialAccounts, userId, feed, status),
            page,
            pageSize: OPPORTUNITY_PAGE_SIZE,
        });

        return { items, total, page, pageSize: OPPORTUNITY_PAGE_SIZE };
    }
}
