import { HttpTransportError } from '../../../../../shared/http/errors/http-transport.error.js';
import type { SocialAccountsService } from '../../../../social-accounts/application/social-accounts.service.js';
import { PostMetricsUnavailableError } from '../../../../social-accounts/domain/errors/post-metrics-unavailable.error.js';
import { OpportunityEntity, type OpportunityMetrics } from '../../../domain/entities/opportunity.entity.js';
import { OpportunityNotFoundError } from '../../../domain/errors/opportunity-not-found.error.js';
import type { OpportunityRepositoryPort } from '../../../domain/ports/opportunity-repository.port.js';
import { RefreshOpportunityMetricsUseCase } from '../refresh-opportunity-metrics.use-case.js';

const NOW = new Date('2026-10-30T12:00:00Z');
const PERMALINK = 'https://www.threads.com/@someone/post/abc';

const stored = (fetchedAt: Date | null): OpportunityMetrics => ({
    likeCount: 3,
    replyCount: 1,
    repostCount: 0,
    authorDisplayName: 'Some One',
    fetchedAt,
});

describe('RefreshOpportunityMetricsUseCase', () => {
    const opportunities = { findByIdForUser: vi.fn(), saveMetrics: vi.fn() };
    const socialAccounts = { getPostMetrics: vi.fn() };
    const useCase = new RefreshOpportunityMetricsUseCase(
        opportunities as unknown as OpportunityRepositoryPort,
        socialAccounts as unknown as SocialAccountsService,
    );
    const opportunity = (metrics: OpportunityMetrics) =>
        new OpportunityEntity('opportunity-id', {
            opportunityFeedId: 'feed-id',
            externalPostId: 'post-1',
            authorUsername: 'someone',
            text: 'A question',
            permalink: PERMALINK,
            publishedAt: new Date('2026-10-30T10:00:00Z'),
            hasReplies: false,
            metrics,
            relevanceScore: 80,
            reason: 'Asks exactly this',
            status: 'NEW',
            excludedTerm: null,
            stale: false,
            matchedQueries: [],
        });
    const refresh = () => useCase.execute('user-id', 'opportunity-id');

    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers({ now: NOW });
        vi.stubEnv('THREADS_POST_METRICS_ENABLED', 'true');
        socialAccounts.getPostMetrics.mockResolvedValue({
            likeCount: 875,
            replyCount: 22,
            repostCount: 66,
            authorDisplayName: 'Jon Someone',
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('reports a missing or foreign opportunity as not found', async () => {
        opportunities.findByIdForUser.mockResolvedValue(null);

        await expect(refresh()).rejects.toBeInstanceOf(OpportunityNotFoundError);
        expect(opportunities.findByIdForUser).toHaveBeenCalledWith('opportunity-id', 'user-id');
    });

    it.each([undefined, 'false'])(
        'returns stored metrics without a request when the switch is %s',
        async (value) => {
            vi.stubEnv('THREADS_POST_METRICS_ENABLED', value);
            opportunities.findByIdForUser.mockResolvedValue(opportunity(stored(null)));

            await expect(refresh()).resolves.toEqual(stored(null));
            expect(socialAccounts.getPostMetrics).not.toHaveBeenCalled();
        },
    );

    it('returns metrics younger than an hour without a request', async () => {
        const fresh = stored(new Date(NOW.getTime() - 59 * 60_000));
        opportunities.findByIdForUser.mockResolvedValue(opportunity(fresh));

        await expect(refresh()).resolves.toEqual(fresh);
        expect(socialAccounts.getPostMetrics).not.toHaveBeenCalled();
    });

    it.each([null, new Date(NOW.getTime() - 60 * 60_000)])(
        'fetches, saves and returns new metrics when stored ones are missing or stale (%#)',
        async (fetchedAt) => {
            opportunities.findByIdForUser.mockResolvedValue(opportunity(stored(fetchedAt)));
            const fetched = {
                likeCount: 875,
                replyCount: 22,
                repostCount: 66,
                authorDisplayName: 'Jon Someone',
                fetchedAt: NOW,
            };

            await expect(refresh()).resolves.toEqual(fetched);
            expect(socialAccounts.getPostMetrics).toHaveBeenCalledWith(PERMALINK);
            expect(opportunities.saveMetrics).toHaveBeenCalledWith('opportunity-id', fetched);
        },
    );

    it.each([
        new PostMetricsUnavailableError('status 429'),
        new HttpTransportError(PERMALINK, new Error('timeout')),
    ])('returns stored metrics, saves nothing and warns when the fetch fails (%#)', async (error) => {
        const old = stored(new Date('2026-10-29T12:00:00Z'));
        opportunities.findByIdForUser.mockResolvedValue(opportunity(old));
        socialAccounts.getPostMetrics.mockRejectedValue(error);
        const warn = vi.spyOn(useCase['logger'], 'warn').mockImplementation(() => undefined);

        await expect(refresh()).resolves.toEqual(old);
        expect(opportunities.saveMetrics).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('opportunity-id'));
    });

    it('lets an unexpected error through', async () => {
        opportunities.findByIdForUser.mockResolvedValue(opportunity(stored(null)));
        socialAccounts.getPostMetrics.mockRejectedValue(new TypeError('bug'));

        await expect(refresh()).rejects.toBeInstanceOf(TypeError);
    });
});
