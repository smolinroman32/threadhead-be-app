import type { Job } from 'bullmq';
import type { QueueFactory } from '../../../../../shared/queue/queue.factory.js';
import type { ReconcileDiscoveryRunsUseCase } from '../../../application/use-cases/reconcile-discovery-runs.use-case.js';
import type { RunDiscoveryUseCase } from '../../../application/use-cases/run-discovery.use-case.js';
import type { BullDiscoveryQueue } from '../bull-discovery-queue.js';
import { DiscoveryWorker } from '../discovery.worker.js';

describe('DiscoveryWorker', () => {
    const factory = { createWorker: vi.fn() };
    const queue = { scheduleReconcile: vi.fn() };
    const runDiscovery = { execute: vi.fn() };
    const reconcile = { execute: vi.fn() };
    const worker = new DiscoveryWorker(
        factory as unknown as QueueFactory,
        queue as unknown as BullDiscoveryQueue,
        runDiscovery as unknown as RunDiscoveryUseCase,
        reconcile as unknown as ReconcileDiscoveryRunsUseCase,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        reconcile.execute.mockResolvedValue([]);
    });

    it('starts one worker without stall retries, schedules the reconciler and recovers once', async () => {
        await worker.onApplicationBootstrap();

        expect(factory.createWorker).toHaveBeenCalledWith('discovery', expect.any(Function), {
            concurrency: 5,
            maxStalledCount: 0,
        });
        expect(queue.scheduleReconcile).toHaveBeenCalledWith(60_000);
        expect(reconcile.execute).toHaveBeenCalledTimes(1);
    });

    it('routes run jobs to the run use case and reconcile jobs to the reconciler', async () => {
        await worker.process({ name: 'run', data: { runId: 'run-id' } } as Job<{ runId?: string }>);
        await worker.process({ name: 'reconcile', data: {} } as Job<{ runId?: string }>);

        expect(runDiscovery.execute).toHaveBeenCalledWith('run-id');
        expect(reconcile.execute).toHaveBeenCalledTimes(1);
    });
});
