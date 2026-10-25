import type { PrismaService } from '../../../../../shared/prisma.service.js';
import { DiscoveryRunRepository } from '../discovery-run.repository.js';

const NOW = new Date('2026-10-25T12:00:00Z');
const MINUTE = 60_000;

const runRow = (overrides: Record<string, unknown> = {}) => ({
    id: 'run-id',
    opportunityFeedId: 'feed-id',
    status: 'QUEUED',
    scoringVersion: null,
    attempt: 0,
    heartbeatAt: null,
    notBefore: null,
    error: null,
    stats: {},
    createdAt: new Date(NOW.getTime() - 10 * MINUTE),
    startedAt: null,
    finishedAt: null,
    ...overrides,
});

describe('DiscoveryRunRepository', () => {
    const discoveryRun = {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
    };
    const tx = {
        $queryRaw: vi.fn(),
        discoveryRun,
        opportunityFeed: { findUniqueOrThrow: vi.fn() },
    };
    const $transaction = vi.fn();
    const repository = new DiscoveryRunRepository({ $transaction, discoveryRun } as unknown as PrismaService);

    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
        $transaction.mockImplementation(async (work: (client: typeof tx) => unknown) => work(tx));
        discoveryRun.update.mockImplementation(async ({ data }) => runRow(data));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('request', () => {
        it('locks the feed and creates a queued run to enqueue when the feed has none', async () => {
            discoveryRun.count.mockResolvedValue(0);
            discoveryRun.findFirst.mockResolvedValue(null);
            discoveryRun.create.mockResolvedValue(runRow({ id: 'new-run' }));

            const { run, enqueue } = await repository.request('feed-id');

            expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
                discoveryRun.create.mock.invocationCallOrder[0],
            );
            expect(discoveryRun.create).toHaveBeenCalledWith({
                data: { opportunityFeedId: 'feed-id', status: 'QUEUED' },
            });
            expect(run.id).toBe('new-run');
            expect(enqueue).toBe(true);
        });

        it('returns the existing queued run instead of a second one', async () => {
            discoveryRun.count.mockResolvedValue(0);
            discoveryRun.findFirst.mockResolvedValue(runRow({ id: 'queued-run' }));

            const { run, enqueue } = await repository.request('feed-id');

            expect(discoveryRun.create).not.toHaveBeenCalled();
            expect(run.id).toBe('queued-run');
            expect(enqueue).toBe(true);
        });

        it('creates a queued run without a job while another run is running', async () => {
            discoveryRun.count.mockResolvedValue(1);
            discoveryRun.findFirst.mockResolvedValue(null);
            discoveryRun.create.mockResolvedValue(runRow());

            const { enqueue } = await repository.request('feed-id');

            expect(discoveryRun.count).toHaveBeenCalledWith({
                where: {
                    opportunityFeedId: 'feed-id',
                    status: 'RUNNING',
                    heartbeatAt: { gte: new Date(NOW.getTime() - 5 * MINUTE) },
                },
            });
            expect(enqueue).toBe(false);
        });
    });

    describe('claim', () => {
        const feed = { id: 'feed-id', isActive: true, scoringVersion: 4 };

        const given = (run: ReturnType<typeof runRow> | null, running = 0, feedRow = feed) => {
            discoveryRun.findUnique.mockResolvedValue(run);
            discoveryRun.findUniqueOrThrow.mockResolvedValue(run);
            discoveryRun.count.mockResolvedValue(running);
            tx.opportunityFeed.findUniqueOrThrow.mockResolvedValue(feedRow);
        };

        it('claims a queued run with the next attempt and the current feed version', async () => {
            given(runRow());

            const result = await repository.claim('run-id');

            expect(result.outcome).toBe('claimed');
            expect(discoveryRun.update).toHaveBeenCalledWith({
                where: { id: 'run-id' },
                data: {
                    status: 'RUNNING',
                    attempt: { increment: 1 },
                    heartbeatAt: NOW,
                    startedAt: NOW,
                    notBefore: null,
                    scoringVersion: 4,
                },
            });
        });

        it('skips a run that is missing, not due yet, finished or running with a fresh heartbeat', async () => {
            given(null);
            await expect(repository.claim('run-id')).resolves.toEqual({ outcome: 'skipped' });

            given(runRow({ notBefore: new Date(NOW.getTime() + MINUTE) }));
            await expect(repository.claim('run-id')).resolves.toEqual({ outcome: 'skipped' });

            given(runRow({ status: 'SUCCEEDED' }));
            await expect(repository.claim('run-id')).resolves.toEqual({ outcome: 'skipped' });

            given(runRow({ status: 'RUNNING', heartbeatAt: new Date(NOW.getTime() - MINUTE) }));
            await expect(repository.claim('run-id')).resolves.toEqual({ outcome: 'skipped' });

            expect(discoveryRun.update).not.toHaveBeenCalled();
        });

        it('skips a queued run while another run of the feed is running', async () => {
            given(runRow(), 1);

            await expect(repository.claim('run-id')).resolves.toEqual({ outcome: 'skipped' });
            expect(discoveryRun.count.mock.calls[0][0].where.id).toEqual({ not: 'run-id' });
        });

        it('takes over a running run whose heartbeat is stale', async () => {
            given(
                runRow({ status: 'RUNNING', attempt: 1, heartbeatAt: new Date(NOW.getTime() - 6 * MINUTE) }),
            );

            await expect(repository.claim('run-id')).resolves.toMatchObject({ outcome: 'claimed' });
        });

        it('puts the run back to queued when the feed is paused', async () => {
            given(runRow(), 0, { ...feed, isActive: false });

            await expect(repository.claim('run-id')).resolves.toEqual({ outcome: 'paused' });
            expect(discoveryRun.update).toHaveBeenCalledWith({
                where: { id: 'run-id' },
                data: { status: 'QUEUED' },
            });
        });
    });

    describe('fenced writes', () => {
        const fence = { runId: 'run-id', attempt: 2 };

        it('writes only after the heartbeat matched the run, the attempt and the running status', async () => {
            discoveryRun.updateMany.mockResolvedValue({ count: 1 });

            await expect(repository.heartbeat(fence, { scored: 3 })).resolves.toBe(true);
            expect(discoveryRun.updateMany).toHaveBeenCalledWith({
                where: { id: 'run-id', attempt: 2, status: 'RUNNING' },
                data: { heartbeatAt: NOW },
            });
            expect(discoveryRun.update).toHaveBeenCalledWith({
                where: { id: 'run-id' },
                data: { stats: { scored: 3 } },
            });
        });

        it('writes nothing for an outdated executor', async () => {
            discoveryRun.updateMany.mockResolvedValue({ count: 0 });

            await expect(repository.heartbeat(fence, {})).resolves.toBe(false);
            await expect(repository.pause(fence, {})).resolves.toBe(false);
            await expect(
                repository.finish(fence, { status: 'SUCCEEDED', error: null, stats: {} }),
            ).resolves.toBeNull();
            await expect(repository.retryLater(fence, {}, 'llm_unavailable')).resolves.toEqual({
                outcome: 'fenced',
            });
            expect(discoveryRun.update).not.toHaveBeenCalled();
        });

        it('finishes the run and returns the next queued run of an active feed', async () => {
            discoveryRun.updateMany.mockResolvedValue({ count: 1 });
            discoveryRun.findFirst.mockResolvedValue({ id: 'next-run' });

            await expect(
                repository.finish(fence, {
                    status: 'FAILED',
                    error: 'search_permission_narrowed',
                    stats: {},
                }),
            ).resolves.toBe('next-run');
            expect(discoveryRun.update.mock.calls[0][0].data).toMatchObject({
                status: 'FAILED',
                error: 'search_permission_narrowed',
                finishedAt: NOW,
            });
            expect(discoveryRun.findFirst).toHaveBeenCalledWith({
                where: {
                    opportunityFeedId: 'feed-id',
                    status: 'QUEUED',
                    opportunityFeed: { isActive: true },
                },
                select: { id: true },
            });
        });

        it('requeues a retryable failure before the last attempt and fails it on the last one', async () => {
            discoveryRun.updateMany.mockResolvedValue({ count: 1 });
            discoveryRun.findFirst.mockResolvedValue(null);

            await expect(
                repository.retryLater({ runId: 'run-id', attempt: 1 }, {}, 'llm_rate_limited'),
            ).resolves.toEqual({
                outcome: 'requeued',
                notBefore: new Date(NOW.getTime() + MINUTE),
            });
            expect(discoveryRun.update.mock.calls[0][0].data).toMatchObject({
                status: 'QUEUED',
                error: 'llm_rate_limited',
            });

            await expect(repository.retryLater(fence, {}, 'llm_rate_limited')).resolves.toEqual({
                outcome: 'failed',
                nextRunId: null,
            });
            expect(discoveryRun.update.mock.calls[1][0].data).toMatchObject({
                status: 'FAILED',
                finishedAt: NOW,
            });
        });
    });

    describe('findLastCountedRunAt', () => {
        it('reads the newest run of the feed that did not fail', async () => {
            const createdAt = new Date(NOW.getTime() - MINUTE);
            discoveryRun.findFirst.mockResolvedValue({ createdAt });

            await expect(repository.findLastCountedRunAt('feed-id')).resolves.toEqual(createdAt);
            expect(discoveryRun.findFirst).toHaveBeenCalledWith({
                where: { opportunityFeedId: 'feed-id', status: { not: 'FAILED' } },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true },
            });
        });

        it('is null when the feed has no such run', async () => {
            discoveryRun.findFirst.mockResolvedValue(null);

            await expect(repository.findLastCountedRunAt('feed-id')).resolves.toBeNull();
        });
    });

    describe('reconcile', () => {
        it('requeues or fails stale running runs and returns the queued runs that are due', async () => {
            discoveryRun.findMany
                .mockResolvedValueOnce([
                    runRow({ id: 'retry', status: 'RUNNING', attempt: 1 }),
                    runRow({ id: 'last', status: 'RUNNING', attempt: 2 }),
                    runRow({
                        id: 'superseded',
                        status: 'RUNNING',
                        attempt: 1,
                        opportunityFeedId: 'other-feed',
                    }),
                ])
                .mockResolvedValueOnce([{ id: 'retry' }, { id: 'waiting' }]);
            discoveryRun.count.mockImplementation(async ({ where }) =>
                where.opportunityFeedId === 'other-feed' ? 1 : 0,
            );

            await expect(repository.reconcile()).resolves.toEqual(['retry', 'waiting']);

            const staleBefore = new Date(NOW.getTime() - 5 * MINUTE);
            expect(discoveryRun.updateMany.mock.calls.map((call) => call[0])).toEqual([
                {
                    where: { id: 'retry', status: 'RUNNING', heartbeatAt: { lt: staleBefore } },
                    data: { status: 'QUEUED', notBefore: null },
                },
                {
                    where: { id: 'last', status: 'RUNNING', heartbeatAt: { lt: staleBefore } },
                    data: { status: 'FAILED', error: 'worker_lost', finishedAt: NOW },
                },
                {
                    where: { id: 'superseded', status: 'RUNNING', heartbeatAt: { lt: staleBefore } },
                    data: { status: 'FAILED', error: 'worker_lost', finishedAt: NOW },
                },
            ]);
            expect(discoveryRun.findMany.mock.calls[1][0].where).toMatchObject({
                status: 'QUEUED',
                createdAt: { lt: new Date(NOW.getTime() - MINUTE) },
                opportunityFeed: { isActive: true },
            });
        });
    });
});
