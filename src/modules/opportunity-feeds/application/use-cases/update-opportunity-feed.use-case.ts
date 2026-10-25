import { Injectable } from '@nestjs/common';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { bindFeedAccount, criteriaChanged } from '../../domain/entities/feed-criteria.js';
import {
    mergeFeedFields,
    type OpportunityFeedChanges,
} from '../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { requireOwnedAccount } from '../feed-account.js';
import { QueueDiscoveryRunUseCase } from './queue-discovery-run.use-case.js';

@Injectable()
export class UpdateOpportunityFeedUseCase {
    constructor(
        private readonly repository: OpportunityFeedRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
        private readonly discovery: QueueDiscoveryRunUseCase,
    ) {}

    async execute(userId: string, id: string, changes: OpportunityFeedChanges) {
        if (changes.socialAccountId !== undefined) {
            await requireOwnedAccount(this.socialAccounts, userId, changes.socialAccountId);
        }

        const change = { criteriaChanged: false, resumed: false };
        const feed = await this.repository.updateLocked(id, userId, (current) => {
            const fields = mergeFeedFields(current.fields, changes);

            change.criteriaChanged = criteriaChanged(current.fields, fields);
            change.resumed = !current.isActive && fields.isActive;

            return {
                fields,
                socialAccountId: bindFeedAccount(current.socialAccountId, changes.socialAccountId),
                criteriaChanged: change.criteriaChanged,
            };
        });

        if (!feed) throw new OpportunityFeedNotFoundError();

        await this.discovery.afterChange(feed.id, change);

        return feed;
    }
}
