import { HttpTransportError } from '../../../../../shared/http/errors/http-transport.error.js';
import type { SocialAccountsService } from '../../../../social-accounts/application/social-accounts.service.js';
import { SocialProviderPermissionDeniedError } from '../../../../social-accounts/domain/errors/social-provider-permission-denied.error.js';
import { SocialProviderUnavailableError } from '../../../../social-accounts/domain/errors/social-provider-unavailable.error.js';
import { OpportunityEntity, type OpportunityStatus } from '../../../domain/entities/opportunity.entity.js';
import { OpportunityFeedAccountRequiredError } from '../../../domain/errors/opportunity-feed-account-required.error.js';
import { OpportunityNotFoundError } from '../../../domain/errors/opportunity-not-found.error.js';
import { OpportunityRepliedError } from '../../../domain/errors/opportunity-replied.error.js';
import { OpportunityReplyOutcomeUnknownError } from '../../../domain/errors/opportunity-reply-outcome-unknown.error.js';
import { OpportunityReplyPermissionDeniedError } from '../../../domain/errors/opportunity-reply-permission-denied.error.js';
import { OpportunityReplyTextInvalidError } from '../../../domain/errors/opportunity-reply-text-invalid.error.js';
import type { OpportunityFeedRepositoryPort } from '../../../domain/ports/opportunity-feed-repository.port.js';
import type { OpportunityRepositoryPort } from '../../../domain/ports/opportunity-repository.port.js';
import { ReplyToOpportunityUseCase } from '../reply-to-opportunity.use-case.js';

describe('ReplyToOpportunityUseCase', () => {
    const opportunities = { findByIdForUser: vi.fn(), claimForReply: vi.fn(), releaseReply: vi.fn() };
    const feeds = { findByIdForUser: vi.fn() };
    const socialAccounts = { publishReply: vi.fn(), refreshGrantedScopes: vi.fn() };
    const useCase = new ReplyToOpportunityUseCase(
        opportunities as unknown as OpportunityRepositoryPort,
        feeds as unknown as OpportunityFeedRepositoryPort,
        socialAccounts as unknown as SocialAccountsService,
    );
    const opportunity = (status: OpportunityStatus) =>
        new OpportunityEntity('opportunity-id', {
            opportunityFeedId: 'feed-id',
            externalPostId: 'post-1',
            authorUsername: 'someone',
            text: 'A question',
            permalink: 'https://www.threads.net/@someone/post/1',
            publishedAt: new Date('2026-10-29T10:00:00Z'),
            hasReplies: false,
            relevanceScore: 80,
            reason: 'Asks exactly this',
            status,
            excludedTerm: null,
            stale: false,
            matchedQueries: [],
        });
    const reply = () => useCase.execute('user-id', 'opportunity-id', '  My answer  ');

    beforeEach(() => {
        vi.resetAllMocks();
        opportunities.findByIdForUser
            .mockResolvedValueOnce(opportunity('SAVED'))
            .mockResolvedValueOnce(opportunity('REPLIED'));
        opportunities.claimForReply.mockResolvedValue(true);
        feeds.findByIdForUser.mockResolvedValue({ socialAccountId: 'account-id' });
        socialAccounts.publishReply.mockResolvedValue({ id: 'reply-1' });
        socialAccounts.refreshGrantedScopes.mockResolvedValue({});
    });

    it('claims, publishes the trimmed text to the post and returns the replied opportunity', async () => {
        await expect(reply()).resolves.toMatchObject({ status: 'REPLIED' });

        expect(opportunities.findByIdForUser).toHaveBeenCalledWith('opportunity-id', 'user-id');
        expect(feeds.findByIdForUser).toHaveBeenCalledWith('feed-id', 'user-id');
        expect(opportunities.claimForReply).toHaveBeenCalledWith('opportunity-id', 'SAVED');
        expect(socialAccounts.publishReply).toHaveBeenCalledWith('account-id', {
            replyToId: 'post-1',
            text: 'My answer',
        });
        expect(opportunities.releaseReply).not.toHaveBeenCalled();
    });

    it.each(['', '   ', 'a'.repeat(501)])('rejects invalid text before any read (%#)', async (text) => {
        await expect(useCase.execute('user-id', 'opportunity-id', text)).rejects.toBeInstanceOf(
            OpportunityReplyTextInvalidError,
        );
        expect(opportunities.findByIdForUser).not.toHaveBeenCalled();
    });

    it('reports a missing opportunity as not found', async () => {
        opportunities.findByIdForUser.mockReset().mockResolvedValue(null);

        await expect(reply()).rejects.toBeInstanceOf(OpportunityNotFoundError);
    });

    it('refuses an opportunity that is already replied without calling Threads', async () => {
        opportunities.findByIdForUser.mockReset().mockResolvedValue(opportunity('REPLIED'));

        await expect(reply()).rejects.toBeInstanceOf(OpportunityRepliedError);
        expect(opportunities.claimForReply).not.toHaveBeenCalled();
        expect(socialAccounts.publishReply).not.toHaveBeenCalled();
    });

    it('requires an account on the feed', async () => {
        feeds.findByIdForUser.mockResolvedValue({ socialAccountId: null });

        await expect(reply()).rejects.toBeInstanceOf(OpportunityFeedAccountRequiredError);
        expect(opportunities.claimForReply).not.toHaveBeenCalled();
    });

    it('refuses when a parallel request claimed the opportunity first', async () => {
        opportunities.claimForReply.mockResolvedValue(false);

        await expect(reply()).rejects.toBeInstanceOf(OpportunityRepliedError);
        expect(socialAccounts.publishReply).not.toHaveBeenCalled();
    });

    it('releases the claim and passes other provider errors through', async () => {
        const unavailable = new SocialProviderUnavailableError();
        socialAccounts.publishReply.mockRejectedValue(unavailable);

        await expect(reply()).rejects.toBe(unavailable);
        expect(opportunities.releaseReply).toHaveBeenCalledWith('opportunity-id', 'SAVED');
    });

    it('refreshes the granted scopes and reports missing permissions', async () => {
        socialAccounts.publishReply.mockRejectedValue(new SocialProviderPermissionDeniedError());

        await expect(reply()).rejects.toBeInstanceOf(OpportunityReplyPermissionDeniedError);
        expect(opportunities.releaseReply).toHaveBeenCalledWith('opportunity-id', 'SAVED');
        expect(socialAccounts.refreshGrantedScopes).toHaveBeenCalledWith('account-id');
    });

    it('still reports missing permissions when the scopes refresh fails', async () => {
        socialAccounts.publishReply.mockRejectedValue(new SocialProviderPermissionDeniedError());
        socialAccounts.refreshGrantedScopes.mockRejectedValue(new Error('boom'));

        await expect(reply()).rejects.toBeInstanceOf(OpportunityReplyPermissionDeniedError);
    });

    it('reports a transport failure as an unknown outcome', async () => {
        socialAccounts.publishReply.mockRejectedValue(
            new HttpTransportError('https://graph.threads.net', new Error('timeout')),
        );

        await expect(reply()).rejects.toBeInstanceOf(OpportunityReplyOutcomeUnknownError);
        expect(opportunities.releaseReply).toHaveBeenCalledWith('opportunity-id', 'SAVED');
    });
});
