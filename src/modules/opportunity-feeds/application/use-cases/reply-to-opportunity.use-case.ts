import { Injectable, Logger } from '@nestjs/common';
import { HttpTransportError } from '../../../../shared/http/errors/http-transport.error.js';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { SocialProviderPermissionDeniedError } from '../../../social-accounts/domain/errors/social-provider-permission-denied.error.js';
import { replyText } from '../../domain/entities/reply-text.js';
import { OpportunityFeedAccountRequiredError } from '../../domain/errors/opportunity-feed-account-required.error.js';
import { OpportunityNotFoundError } from '../../domain/errors/opportunity-not-found.error.js';
import { OpportunityRepliedError } from '../../domain/errors/opportunity-replied.error.js';
import { OpportunityReplyOutcomeUnknownError } from '../../domain/errors/opportunity-reply-outcome-unknown.error.js';
import { OpportunityReplyPermissionDeniedError } from '../../domain/errors/opportunity-reply-permission-denied.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { OpportunityRepositoryPort } from '../../domain/ports/opportunity-repository.port.js';

@Injectable()
export class ReplyToOpportunityUseCase {
    private readonly logger = new Logger(ReplyToOpportunityUseCase.name);

    constructor(
        private readonly opportunities: OpportunityRepositoryPort,
        private readonly feeds: OpportunityFeedRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
    ) {}

    async execute(userId: string, id: string, rawText: string) {
        const text = replyText(rawText);
        const opportunity = await this.opportunities.findByIdForUser(id, userId);

        if (!opportunity) throw new OpportunityNotFoundError();

        const status = opportunity.status;

        if (status === 'REPLIED') throw new OpportunityRepliedError();

        const feed = await this.feeds.findByIdForUser(opportunity.opportunityFeedId, userId);
        const accountId = feed?.socialAccountId;

        if (!accountId) throw new OpportunityFeedAccountRequiredError();
        if (!(await this.opportunities.claimForReply(id, status))) throw new OpportunityRepliedError();

        try {
            await this.socialAccounts.publishReply(accountId, {
                replyToId: opportunity.externalPostId,
                text,
            });
        } catch (error) {
            await this.opportunities.releaseReply(id, status);

            throw await this.translate(error, accountId);
        }

        const replied = await this.opportunities.findByIdForUser(id, userId);

        if (!replied) throw new OpportunityNotFoundError();

        return replied;
    }

    private async translate(error: unknown, accountId: string) {
        if (error instanceof HttpTransportError) return new OpportunityReplyOutcomeUnknownError();
        if (!(error instanceof SocialProviderPermissionDeniedError)) return error;

        await this.socialAccounts.refreshGrantedScopes(accountId).catch((refreshError: unknown) => {
            this.logger.warn(`Granted scopes refresh failed for ${accountId}: ${String(refreshError)}`);
        });

        return new OpportunityReplyPermissionDeniedError();
    }
}
