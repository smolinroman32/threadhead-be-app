import { LlmInvalidResponseError } from '../../../../../shared/llm/errors/llm-invalid-response.error.js';
import { LlmRateLimitedError } from '../../../../../shared/llm/errors/llm-rate-limited.error.js';
import type { LlmPort } from '../../../../../shared/llm/ports/llm.port.js';
import type { SocialAccountsService } from '../../../../social-accounts/application/social-accounts.service.js';
import { DiscoveryRunEntity } from '../../../domain/entities/discovery-run.entity.js';
import { OpportunityFeedEntity } from '../../../domain/entities/opportunity-feed.entity.js';
import type { DiscoveryQueuePort } from '../../../domain/ports/discovery-queue.port.js';
import type { DiscoveryRunRepositoryPort } from '../../../domain/ports/discovery-run-repository.port.js';
import type { DiscoveryWorkPort } from '../../../domain/ports/discovery-work.port.js';
import type { OpportunityFeedRepositoryPort } from '../../../domain/ports/opportunity-feed-repository.port.js';
import { RunDiscoveryUseCase } from '../run-discovery.use-case.js';

const NOW = new Date('2026-10-25T12:00:00Z');
const HOUR = 60 * 60_000;

const feedEntity = (overrides: Partial<{ isActive: boolean; socialAccountId: string | null }> = {}) =>
    new OpportunityFeedEntity('feed-id', {
        userId: 'user-id',
        name: 'AI agents',
        description: '',
        color: '#5F947B',
        intent: 'Find people asking about AI agents',
        targetAudience: 'Founders',
        includeTerms: ['ai agents'],
        excludeTerms: ['crypto'],
        languages: ['en'],
        socialAccountId: 'account-id',
        scoringVersion: 3,
        freshnessHours: 24,
        minScore: 60,
        isActive: true,
        createdAt: NOW,
        updatedAt: NOW,
        ...overrides,
    });

const claimedRun = new DiscoveryRunEntity('run-id', {
    opportunityFeedId: 'feed-id',
    status: 'RUNNING',
    scoringVersion: 3,
    attempt: 1,
    heartbeatAt: NOW,
    notBefore: null,
    error: null,
    stats: {},
    createdAt: NOW,
    startedAt: NOW,
    finishedAt: null,
});

const post = (id: string, overrides: Record<string, unknown> = {}) => ({
    id,
    text: `A long enough question about AI agents number ${id}`,
    username: 'someone',
    publishedAt: new Date(NOW.getTime() - HOUR),
    permalink: `https://www.threads.net/@someone/post/${id}`,
    hasReplies: false,
    isReply: false,
    mediaType: 'TEXT_POST',
    isQuotePost: false,
    ...overrides,
});

describe('RunDiscoveryUseCase', () => {
    const runs = {
        claim: vi.fn(),
        heartbeat: vi.fn(),
        finish: vi.fn(),
        retryLater: vi.fn(),
        pause: vi.fn(),
    };
    const work = {
        activeQueries: vi.fn(),
        createQueries: vi.fn(),
        addMatched: vi.fn(),
        existingPostIds: vi.fn(),
        linkExisting: vi.fn(),
        staleOpportunities: vi.fn(),
        saveScored: vi.fn(),
        saveRescored: vi.fn(),
    };
    const feeds = { findById: vi.fn() };
    const socialAccounts = { list: vi.fn(), searchPosts: vi.fn(), checkSearchAccess: vi.fn() };
    const llm = { completeJson: vi.fn() };
    const queue = { enqueue: vi.fn() };
    const useCase = new RunDiscoveryUseCase(
        runs as unknown as DiscoveryRunRepositoryPort,
        work as unknown as DiscoveryWorkPort,
        feeds as unknown as OpportunityFeedRepositoryPort,
        socialAccounts as unknown as SocialAccountsService,
        llm as unknown as LlmPort,
        queue as unknown as DiscoveryQueuePort,
    );
    const account = (overrides: Record<string, unknown> = {}) => ({
        id: 'account-id',
        username: 'owner',
        isActive: true,
        searchAccess: 'OK',
        searchAccessCheckedAt: NOW,
        ...overrides,
    });
    const scoresFor = (count: number, score = 80) => ({
        scores: Array.from({ length: count }, (_, index) => ({
            ref: `p${index + 1}`,
            relevanceScore: score,
            reason: 'Asks exactly this',
        })),
    });
    const finished = () => runs.finish.mock.calls[0]?.[1];

    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
        vi.stubEnv('DISCOVERY_QUERY_MODEL', 'model-q');
        vi.stubEnv('DISCOVERY_SCORING_MODEL', 'model-s');
        runs.claim.mockResolvedValue({ outcome: 'claimed', run: claimedRun });
        runs.heartbeat.mockResolvedValue(true);
        runs.finish.mockResolvedValue(null);
        feeds.findById.mockResolvedValue(feedEntity());
        socialAccounts.list.mockResolvedValue([account()]);
        work.activeQueries.mockResolvedValue([
            { id: 'q1', query: 'ai agents', type: 'KEYWORD' },
            { id: 'q2', query: 'compare agent frameworks', type: 'PHRASE' },
        ]);
        work.staleOpportunities.mockResolvedValue([]);
        work.existingPostIds.mockResolvedValue(new Set());
        work.saveScored.mockResolvedValue(true);
        work.saveRescored.mockResolvedValue(true);
        socialAccounts.searchPosts.mockResolvedValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('does nothing for a run it could not claim', async () => {
        runs.claim.mockResolvedValue({ outcome: 'skipped' });

        await useCase.execute('run-id');

        expect(feeds.findById).not.toHaveBeenCalled();
        expect(runs.finish).not.toHaveBeenCalled();
    });

    it('searches every query, prefilters, scores and saves new posts, then queues the next run', async () => {
        socialAccounts.searchPosts
            .mockResolvedValueOnce([post('a'), post('b'), post('own', { username: 'Owner' })])
            .mockResolvedValueOnce([post('b'), post('known')]);
        work.existingPostIds.mockResolvedValue(new Set(['known']));
        llm.completeJson.mockResolvedValue(scoresFor(2));
        runs.finish.mockResolvedValue('next-run');

        await useCase.execute('run-id');

        expect(socialAccounts.searchPosts).toHaveBeenCalledWith('account-id', {
            query: 'ai agents',
            since: new Date(NOW.getTime() - 24 * HOUR),
            limit: 100,
        });
        expect(work.addMatched.mock.calls).toEqual([
            ['q1', 3],
            ['q2', 2],
        ]);
        expect(work.linkExisting).toHaveBeenCalledWith('feed-id', [
            { externalPostId: 'known', queryIds: ['q2'] },
        ]);
        expect(llm.completeJson).toHaveBeenCalledTimes(1);
        const [, , saved] = work.saveScored.mock.calls[0];
        expect(work.saveScored.mock.calls[0][0]).toEqual({ runId: 'run-id', attempt: 1 });
        expect(work.saveScored.mock.calls[0][1]).toEqual({ id: 'feed-id', scoringVersion: 3, minScore: 60 });
        expect(
            saved.map((item: { post: { id: string }; queryIds: string[] }) => [item.post.id, item.queryIds]),
        ).toEqual([
            ['a', ['q1']],
            ['b', ['q1', 'q2']],
        ]);
        expect(finished()).toMatchObject({
            status: 'SUCCEEDED',
            error: null,
            stats: {
                queries: 2,
                fetched: 5,
                deduped: 1,
                scored: 2,
                unscored: 0,
                dropped: { own: 1 },
                warnings: [],
            },
        });
        expect(queue.enqueue).toHaveBeenCalledWith('next-run');
    });

    it('creates keyword queries and generated phrases for a feed without queries', async () => {
        work.activeQueries.mockResolvedValue([]);
        work.createQueries.mockImplementation(async (_feed, queries) =>
            queries.map((query: { query: string; type: string }, index: number) => ({
                id: `n${index}`,
                ...query,
            })),
        );
        llm.completeJson.mockResolvedValueOnce({ phrases: ['compare agent frameworks'] });

        await useCase.execute('run-id');

        expect(work.createQueries.mock.calls).toEqual([
            ['feed-id', [{ query: 'ai agents', type: 'KEYWORD' }]],
            ['feed-id', [{ query: 'compare agent frameworks', type: 'PHRASE' }]],
        ]);
        expect(llm.completeJson.mock.calls[0][0]).toMatchObject({
            model: 'model-q',
            schemaName: 'search_phrases',
        });
        expect(finished().stats.queries).toBe(2);
    });

    it('keeps the keyword queries and warns when the phrase generation fails', async () => {
        work.activeQueries.mockResolvedValue([{ id: 'q1', query: 'ai agents', type: 'KEYWORD' }]);
        llm.completeJson.mockRejectedValueOnce(new LlmRateLimitedError());

        await useCase.execute('run-id');

        expect(work.createQueries).not.toHaveBeenCalled();
        expect(finished()).toMatchObject({
            status: 'SUCCEEDED',
            stats: { warnings: ['query_generation_failed'] },
        });
    });

    it('marks a query that returned the full limit as possibly truncated', async () => {
        socialAccounts.searchPosts.mockResolvedValueOnce(
            Array.from({ length: 100 }, (_, index) => post(`x${index}`, { text: 'short' })),
        );

        await useCase.execute('run-id');

        expect(finished().stats.truncatedQueries).toEqual(['ai agents']);
    });

    it('retries an invalid scoring answer once, then leaves the batch unscored with a warning', async () => {
        socialAccounts.searchPosts.mockResolvedValueOnce([post('a')]);
        llm.completeJson.mockRejectedValue(new LlmInvalidResponseError());

        await useCase.execute('run-id');

        expect(llm.completeJson).toHaveBeenCalledTimes(2);
        expect(work.saveScored).not.toHaveBeenCalled();
        expect(finished()).toMatchObject({
            status: 'SUCCEEDED',
            stats: { unscored: 1, warnings: ['partial_scoring'] },
        });
    });

    it('rescores stale opportunities of the feed with short refs before searching', async () => {
        work.staleOpportunities.mockResolvedValue([
            { id: 'o1', text: 'Old post one about agents' },
            { id: 'o2', text: 'Old post two about agents' },
        ]);
        llm.completeJson.mockResolvedValueOnce({
            scores: [{ ref: 'p2', relevanceScore: 70, reason: 'Still relevant' }],
        });

        await useCase.execute('run-id');

        expect(work.staleOpportunities).toHaveBeenCalledWith(
            'feed-id',
            3,
            new Date(NOW.getTime() - 24 * HOUR),
        );
        expect(work.saveRescored).toHaveBeenCalledWith({ runId: 'run-id', attempt: 1 }, 3, [
            { id: 'o2', relevanceScore: 70, reason: 'Still relevant' },
        ]);
        expect(finished().stats).toMatchObject({ rescored: 1, unscored: 1 });
    });

    it('stops silently when a newer executor owns the run', async () => {
        runs.heartbeat.mockResolvedValue(false);

        await useCase.execute('run-id');

        expect(socialAccounts.searchPosts).not.toHaveBeenCalled();
        expect(runs.finish).not.toHaveBeenCalled();
        expect(runs.pause).not.toHaveBeenCalled();
    });

    it('stops silently when saving a batch is fenced out', async () => {
        socialAccounts.searchPosts.mockResolvedValueOnce([post('a')]);
        llm.completeJson.mockResolvedValue(scoresFor(1));
        work.saveScored.mockResolvedValue(false);

        await useCase.execute('run-id');

        expect(runs.finish).not.toHaveBeenCalled();
    });

    it('puts the run back to queued when the feed was paused', async () => {
        feeds.findById.mockResolvedValueOnce(feedEntity()).mockResolvedValue(feedEntity({ isActive: false }));

        await useCase.execute('run-id');

        expect(runs.pause).toHaveBeenCalledWith({ runId: 'run-id', attempt: 1 }, expect.any(Object));
        expect(runs.finish).not.toHaveBeenCalled();
    });

    it.each([
        { name: 'a disconnected account', accounts: [], error: 'account_disconnected' },
        {
            name: 'an account to reconnect',
            accounts: [account({ isActive: false })],
            error: 'reconnect_required',
        },
    ])('fails the run for $name', async ({ accounts, error }) => {
        socialAccounts.list.mockResolvedValue(accounts);

        await useCase.execute('run-id');

        expect(finished()).toMatchObject({ status: 'FAILED', error });
        expect(socialAccounts.searchPosts).not.toHaveBeenCalled();
    });

    it('fails a recently narrowed account before any search', async () => {
        socialAccounts.list.mockResolvedValue([
            account({ searchAccess: 'NARROWED', searchAccessCheckedAt: NOW }),
        ]);

        await useCase.execute('run-id');

        expect(socialAccounts.checkSearchAccess).not.toHaveBeenCalled();
        expect(socialAccounts.searchPosts).not.toHaveBeenCalled();
        expect(finished()).toMatchObject({ status: 'FAILED', error: 'search_permission_narrowed' });
    });

    it('rechecks an old narrowed result first and searches when access is back', async () => {
        socialAccounts.list.mockResolvedValue([
            account({ searchAccess: 'NARROWED', searchAccessCheckedAt: new Date(NOW.getTime() - 25 * HOUR) }),
        ]);
        socialAccounts.checkSearchAccess.mockResolvedValue({ searchAccess: 'OK', checkedAt: NOW });

        await useCase.execute('run-id');

        expect(socialAccounts.searchPosts).toHaveBeenCalled();
        expect(finished()).toMatchObject({ status: 'SUCCEEDED', stats: { searchAccessCheck: 'ok' } });
    });

    it.each([
        { access: 'NARROWED', status: 'FAILED', error: 'search_permission_narrowed', warnings: [] },
        { access: 'OK', status: 'SUCCEEDED', error: null, warnings: [] },
        { access: 'UNKNOWN', status: 'SUCCEEDED', error: null, warnings: ['permission_check_inconclusive'] },
    ])('checks access when every result is own and ends $status for $access', async (row) => {
        socialAccounts.searchPosts.mockResolvedValue([post('own', { username: 'OWNER' })]);
        socialAccounts.checkSearchAccess.mockResolvedValue({ searchAccess: row.access, checkedAt: NOW });

        await useCase.execute('run-id');

        expect(finished()).toMatchObject({
            status: row.status,
            error: row.error,
            stats: { warnings: row.warnings },
        });
    });

    it('requeues a rate-limited run with its delay, keeping what was saved', async () => {
        socialAccounts.searchPosts.mockResolvedValueOnce([post('a')]);
        llm.completeJson.mockRejectedValue(new LlmRateLimitedError());
        runs.retryLater.mockResolvedValue({
            outcome: 'requeued',
            notBefore: new Date(NOW.getTime() + 60_000),
        });

        await useCase.execute('run-id');

        expect(runs.retryLater).toHaveBeenCalledWith(
            { runId: 'run-id', attempt: 1 },
            expect.any(Object),
            'llm_rate_limited',
        );
        expect(queue.enqueue).toHaveBeenCalledWith('run-id', 60_000);
        expect(runs.finish).not.toHaveBeenCalled();
    });

    it('queues the next run of the feed when the last attempt fails', async () => {
        socialAccounts.searchPosts.mockResolvedValueOnce([post('a')]);
        llm.completeJson.mockRejectedValue(new LlmRateLimitedError());
        runs.retryLater.mockResolvedValue({ outcome: 'failed', nextRunId: 'next-run' });

        await useCase.execute('run-id');

        expect(queue.enqueue).toHaveBeenCalledWith('next-run');
    });
});
