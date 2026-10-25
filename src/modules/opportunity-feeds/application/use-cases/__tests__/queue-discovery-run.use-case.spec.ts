import type { DiscoveryQueuePort } from '../../../domain/ports/discovery-queue.port.js';
import type { DiscoveryRunRepositoryPort } from '../../../domain/ports/discovery-run-repository.port.js';
import type { DiscoveryWorkPort } from '../../../domain/ports/discovery-work.port.js';
import type { OpportunityFeedRepositoryPort } from '../../../domain/ports/opportunity-feed-repository.port.js';
import { QueueDiscoveryRunUseCase } from '../queue-discovery-run.use-case.js';

describe('QueueDiscoveryRunUseCase', () => {
    const feeds = { findById: vi.fn() };
    const runs = { request: vi.fn(), findLatestForFeed: vi.fn() };
    const work = { staleOpportunities: vi.fn() };
    const queue = { enqueue: vi.fn() };
    const useCase = new QueueDiscoveryRunUseCase(
        feeds as unknown as OpportunityFeedRepositoryPort,
        runs as unknown as DiscoveryRunRepositoryPort,
        work as unknown as DiscoveryWorkPort,
        queue as unknown as DiscoveryQueuePort,
    );
    const feed = (overrides: Record<string, unknown> = {}) => ({
        id: 'feed-id',
        isActive: true,
        socialAccountId: 'account-id',
        freshnessHours: 24,
        scoringVersion: 2,
        ...overrides,
    });

    beforeEach(() => {
        vi.resetAllMocks();
        feeds.findById.mockResolvedValue(feed());
        runs.request.mockResolvedValue({ run: { id: 'run-id' }, enqueue: true });
        runs.findLatestForFeed.mockResolvedValue(null);
        work.staleOpportunities.mockResolvedValue([]);
    });

    it('adds a job only when the repository asks for one', async () => {
        await useCase.execute('feed-id');
        expect(queue.enqueue).toHaveBeenCalledWith('run-id');

        queue.enqueue.mockClear();
        runs.request.mockResolvedValue({ run: { id: 'queued-run' }, enqueue: false });

        await expect(useCase.execute('feed-id')).resolves.toEqual({ id: 'queued-run' });
        expect(queue.enqueue).not.toHaveBeenCalled();
    });

    it('queues a run after a criteria change of an active feed with an account', async () => {
        await useCase.afterChange('feed-id', { criteriaChanged: true, resumed: false });

        expect(runs.request).toHaveBeenCalledWith('feed-id');
    });

    it.each([{ isActive: false }, { socialAccountId: null }])(
        'queues nothing for a feed with %o',
        async (overrides) => {
            feeds.findById.mockResolvedValue(feed(overrides));

            await useCase.afterChange('feed-id', { criteriaChanged: true, resumed: false });

            expect(runs.request).not.toHaveBeenCalled();
        },
    );

    it('queues a run on resume only when a queued run or stale opportunities wait', async () => {
        await useCase.afterChange('feed-id', { criteriaChanged: false, resumed: true });
        expect(runs.request).not.toHaveBeenCalled();

        work.staleOpportunities.mockResolvedValue([{ id: 'o1', text: 'old' }]);
        await useCase.afterChange('feed-id', { criteriaChanged: false, resumed: true });
        expect(runs.request).toHaveBeenCalledTimes(1);

        work.staleOpportunities.mockResolvedValue([]);
        runs.findLatestForFeed.mockResolvedValue({ status: 'QUEUED' });
        await useCase.afterChange('feed-id', { criteriaChanged: false, resumed: true });
        expect(runs.request).toHaveBeenCalledTimes(2);
    });

    it('never fails the feed change when queueing fails', async () => {
        runs.request.mockRejectedValue(new Error('redis down'));

        await expect(
            useCase.afterChange('feed-id', { criteriaChanged: true, resumed: false }),
        ).resolves.toBeUndefined();
    });
});
