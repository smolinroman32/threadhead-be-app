import type { SocialAccountsService } from '../../../../social-accounts/application/social-accounts.service.js';
import { SocialAccountReconnectRequiredError } from '../../../../social-accounts/domain/errors/social-account-reconnect-required.error.js';
import { OpportunityEntity, type OpportunityStatus } from '../../../domain/entities/opportunity.entity.js';
import { DiscoveryRunNotFoundError } from '../../../domain/errors/discovery-run-not-found.error.js';
import { OpportunityFeedAccountRequiredError } from '../../../domain/errors/opportunity-feed-account-required.error.js';
import { OpportunityFeedNotFoundError } from '../../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedPausedError } from '../../../domain/errors/opportunity-feed-paused.error.js';
import { OpportunityNotFoundError } from '../../../domain/errors/opportunity-not-found.error.js';
import { OpportunityRepliedError } from '../../../domain/errors/opportunity-replied.error.js';
import type { DiscoveryRunRepositoryPort } from '../../../domain/ports/discovery-run-repository.port.js';
import type { OpportunityFeedRepositoryPort } from '../../../domain/ports/opportunity-feed-repository.port.js';
import type { OpportunityRepositoryPort } from '../../../domain/ports/opportunity-repository.port.js';
import { ChangeOpportunityStatusUseCase } from '../change-opportunity-status.use-case.js';
import { GetDiscoveryRunUseCase } from '../get-discovery-run.use-case.js';
import { ListOpportunitiesUseCase } from '../list-opportunities.use-case.js';
import type { QueueDiscoveryRunUseCase } from '../queue-discovery-run.use-case.js';
import { RequestDiscoveryRunUseCase } from '../request-discovery-run.use-case.js';

const NOW = new Date('2026-10-25T12:00:00Z');

describe('discovery API use cases', () => {
    const feeds = { findByIdForUser: vi.fn(), updateLocked: vi.fn() };
    const runs = { findByIdForFeed: vi.fn(), findLatestForFeed: vi.fn() };
    const opportunities = { list: vi.fn(), findByIdForUser: vi.fn(), updateStatus: vi.fn() };
    const socialAccounts = { list: vi.fn() };
    const discovery = { execute: vi.fn() };
    const feedPort = feeds as unknown as OpportunityFeedRepositoryPort;
    const accounts = socialAccounts as unknown as SocialAccountsService;
    const feed = (overrides: Record<string, unknown> = {}) => ({
        id: 'feed-id',
        isActive: true,
        socialAccountId: 'account-id',
        minScore: 60,
        freshnessHours: 24,
        scoringVersion: 2,
        fields: {},
        ...overrides,
    });
    const opportunity = (status: OpportunityStatus) =>
        new OpportunityEntity('opportunity-id', {
            opportunityFeedId: 'feed-id',
            externalPostId: 'post-1',
            authorUsername: 'someone',
            text: 'A question',
            permalink: 'https://www.threads.net/@someone/post/1',
            publishedAt: NOW,
            relevanceScore: 80,
            reason: 'Asks exactly this',
            status,
            excludedTerm: null,
            stale: false,
            matchedQueries: ['ai agents'],
        });

    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
        feeds.findByIdForUser.mockResolvedValue(feed());
        socialAccounts.list.mockResolvedValue([{ id: 'account-id', username: 'Owner', isActive: true }]);
        discovery.execute.mockResolvedValue({ id: 'run-id' });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('RequestDiscoveryRunUseCase', () => {
        const useCase = () =>
            new RequestDiscoveryRunUseCase(
                feedPort,
                accounts,
                discovery as unknown as QueueDiscoveryRunUseCase,
            );

        it('queues a run of an active feed with a usable account', async () => {
            await expect(useCase().execute('user-id', 'feed-id')).resolves.toEqual({ id: 'run-id' });
            expect(feeds.findByIdForUser).toHaveBeenCalledWith('feed-id', 'user-id');
            expect(discovery.execute).toHaveBeenCalledWith('feed-id');
        });

        it.each([
            {
                name: 'a missing feed',
                feedRow: null,
                error: OpportunityFeedNotFoundError,
                accounts: undefined,
            },
            {
                name: 'a paused feed',
                feedRow: feed({ isActive: false }),
                error: OpportunityFeedPausedError,
                accounts: undefined,
            },
            {
                name: 'an account to reconnect',
                feedRow: feed(),
                error: SocialAccountReconnectRequiredError,
                accounts: [{ id: 'account-id', username: 'Owner', isActive: false }],
            },
            {
                name: 'a disconnected account',
                feedRow: feed(),
                error: SocialAccountReconnectRequiredError,
                accounts: [],
            },
            {
                name: 'no account to bind',
                feedRow: feed({ socialAccountId: null }),
                error: OpportunityFeedAccountRequiredError,
                accounts: [],
            },
        ])('refuses $name', async ({ feedRow, error, accounts: list }) => {
            feeds.findByIdForUser.mockResolvedValue(feedRow);
            if (list) socialAccounts.list.mockResolvedValue(list);

            await expect(useCase().execute('user-id', 'feed-id')).rejects.toBeInstanceOf(error);
            expect(discovery.execute).not.toHaveBeenCalled();
        });

        it('binds the only active account of an unbound feed before queueing', async () => {
            feeds.findByIdForUser.mockResolvedValue(feed({ socialAccountId: null }));
            feeds.updateLocked.mockImplementation(async (_id, _user, mutate) => {
                const update = mutate({ socialAccountId: null, fields: {} });
                return feed({ socialAccountId: update.socialAccountId });
            });

            await useCase().execute('user-id', 'feed-id');

            expect(feeds.updateLocked).toHaveBeenCalledWith('feed-id', 'user-id', expect.any(Function));
            expect(discovery.execute).toHaveBeenCalledWith('feed-id');
        });
    });

    describe('GetDiscoveryRunUseCase', () => {
        const useCase = () =>
            new GetDiscoveryRunUseCase(feedPort, runs as unknown as DiscoveryRunRepositoryPort);

        it('returns a run by id or the latest one of an owned feed', async () => {
            runs.findByIdForFeed.mockResolvedValue({ id: 'run-id' });
            runs.findLatestForFeed.mockResolvedValue({ id: 'latest-run' });

            await expect(useCase().execute('user-id', 'feed-id', 'run-id')).resolves.toEqual({
                id: 'run-id',
            });
            await expect(useCase().execute('user-id', 'feed-id', 'latest')).resolves.toEqual({
                id: 'latest-run',
            });
            expect(runs.findByIdForFeed).toHaveBeenCalledWith('feed-id', 'run-id');
        });

        it('reports a foreign feed or a missing run as not found', async () => {
            feeds.findByIdForUser.mockResolvedValueOnce(null);
            await expect(useCase().execute('user-id', 'feed-id', 'latest')).rejects.toBeInstanceOf(
                OpportunityFeedNotFoundError,
            );

            runs.findLatestForFeed.mockResolvedValue(null);
            await expect(useCase().execute('user-id', 'feed-id', 'latest')).rejects.toBeInstanceOf(
                DiscoveryRunNotFoundError,
            );
        });
    });

    describe('ListOpportunitiesUseCase', () => {
        const useCase = () =>
            new ListOpportunitiesUseCase(
                feedPort,
                opportunities as unknown as OpportunityRepositoryPort,
                accounts,
            );

        it('filters new opportunities by score, freshness and the feed account', async () => {
            opportunities.list.mockResolvedValue({ items: [], hasMore: false });

            await useCase().execute('user-id', 'feed-id', 'NEW');

            expect(opportunities.list).toHaveBeenCalledWith({
                feedId: 'feed-id',
                status: 'NEW',
                newOnly: {
                    minScore: 60,
                    publishedSince: new Date(NOW.getTime() - 24 * 60 * 60_000),
                    excludeAuthor: 'Owner',
                },
                limit: 100,
            });
        });

        it('applies no filters to saved, dismissed and replied', async () => {
            opportunities.list.mockResolvedValue({ items: [], hasMore: false });

            await useCase().execute('user-id', 'feed-id', 'SAVED');

            expect(opportunities.list.mock.calls[0][0]).toMatchObject({ status: 'SAVED', newOnly: null });
            expect(socialAccounts.list).not.toHaveBeenCalled();
        });

        it('reports a foreign feed as not found', async () => {
            feeds.findByIdForUser.mockResolvedValue(null);

            await expect(useCase().execute('user-id', 'feed-id', 'NEW')).rejects.toBeInstanceOf(
                OpportunityFeedNotFoundError,
            );
        });
    });

    describe('ChangeOpportunityStatusUseCase', () => {
        const useCase = () =>
            new ChangeOpportunityStatusUseCase(opportunities as unknown as OpportunityRepositoryPort);

        it.each([
            ['NEW', 'SAVED'],
            ['NEW', 'DISMISSED'],
            ['SAVED', 'NEW'],
            ['SAVED', 'DISMISSED'],
            ['DISMISSED', 'NEW'],
            ['DISMISSED', 'SAVED'],
        ] as const)('moves %s to %s', async (from, to) => {
            opportunities.findByIdForUser.mockResolvedValue(opportunity(from));
            opportunities.updateStatus.mockResolvedValue(opportunity(to));

            await expect(useCase().execute('user-id', 'opportunity-id', to)).resolves.toMatchObject({
                status: to,
            });
            expect(opportunities.updateStatus).toHaveBeenCalledWith('opportunity-id', to);
        });

        it.each(['NEW', 'SAVED', 'DISMISSED'] as const)(
            'keeps %s unchanged without a write',
            async (status) => {
                opportunities.findByIdForUser.mockResolvedValue(opportunity(status));

                await expect(useCase().execute('user-id', 'opportunity-id', status)).resolves.toMatchObject({
                    status,
                });
                expect(opportunities.updateStatus).not.toHaveBeenCalled();
            },
        );

        it.each(['NEW', 'SAVED', 'DISMISSED'] as const)(
            'refuses to move a replied opportunity to %s',
            async (to) => {
                opportunities.findByIdForUser.mockResolvedValue(opportunity('REPLIED'));

                await expect(useCase().execute('user-id', 'opportunity-id', to)).rejects.toBeInstanceOf(
                    OpportunityRepliedError,
                );
            },
        );

        it('reports a missing or foreign opportunity as not found', async () => {
            opportunities.findByIdForUser.mockResolvedValue(null);

            await expect(useCase().execute('user-id', 'opportunity-id', 'SAVED')).rejects.toBeInstanceOf(
                OpportunityNotFoundError,
            );
            expect(opportunities.findByIdForUser).toHaveBeenCalledWith('opportunity-id', 'user-id');
        });
    });
});
