import { Injectable } from '@nestjs/common';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { SocialAccountReconnectRequiredError } from '../../../social-accounts/domain/errors/social-account-reconnect-required.error.js';
import { bindFeedAccount } from '../../domain/entities/feed-criteria.js';
import { OpportunityFeedAccountRequiredError } from '../../domain/errors/opportunity-feed-account-required.error.js';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedPausedError } from '../../domain/errors/opportunity-feed-paused.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { accountForNewFeed } from '../feed-account.js';
import { QueueDiscoveryRunUseCase } from './queue-discovery-run.use-case.js';

@Injectable()
export class RequestDiscoveryRunUseCase {
    constructor(
        private readonly feeds: OpportunityFeedRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
        private readonly discovery: QueueDiscoveryRunUseCase,
    ) {}

    async execute(userId: string, feedId: string) {
        const feed = await this.feeds.findByIdForUser(feedId, userId);

        if (!feed) throw new OpportunityFeedNotFoundError();
        if (!feed.isActive) throw new OpportunityFeedPausedError();

        const accountId = feed.socialAccountId ?? (await this.bindOnlyAccount(userId, feedId));
        const account = (await this.socialAccounts.list(userId)).find(
            (candidate) => candidate.id === accountId,
        );

        if (!account?.isActive) throw new SocialAccountReconnectRequiredError();

        return this.discovery.execute(feedId);
    }

    private async bindOnlyAccount(userId: string, feedId: string) {
        const accountId = await accountForNewFeed(this.socialAccounts, userId, undefined);

        if (!accountId) throw new OpportunityFeedAccountRequiredError();

        const bound = await this.feeds.updateLocked(feedId, userId, (current) => ({
            fields: current.fields,
            socialAccountId: bindFeedAccount(current.socialAccountId, accountId),
            criteriaChanged: false,
        }));

        if (!bound?.socialAccountId) throw new OpportunityFeedNotFoundError();

        return bound.socialAccountId;
    }
}
