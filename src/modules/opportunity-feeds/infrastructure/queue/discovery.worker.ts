import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import type { Job } from 'bullmq';
import { QueueFactory } from '../../../../shared/queue/queue.factory.js';
import { ReconcileDiscoveryRunsUseCase } from '../../application/use-cases/reconcile-discovery-runs.use-case.js';
import { RunDiscoveryUseCase } from '../../application/use-cases/run-discovery.use-case.js';
import { RECONCILE_EVERY_MS, WORKER_CONCURRENCY } from '../../domain/discovery/discovery.constants.js';
import { BullDiscoveryQueue, DISCOVERY_QUEUE, RECONCILE_JOB } from './bull-discovery-queue.js';

@Injectable()
export class DiscoveryWorker implements OnApplicationBootstrap {
    private readonly logger = new Logger(DiscoveryWorker.name);

    constructor(
        private readonly factory: QueueFactory,
        private readonly queue: BullDiscoveryQueue,
        private readonly runDiscovery: RunDiscoveryUseCase,
        private readonly reconcile: ReconcileDiscoveryRunsUseCase,
    ) {}

    async onApplicationBootstrap() {
        this.factory.createWorker<{ runId?: string }>(DISCOVERY_QUEUE, (job) => this.process(job), {
            concurrency: WORKER_CONCURRENCY,
            maxStalledCount: 0,
        });

        await this.queue.scheduleReconcile(RECONCILE_EVERY_MS);

        const recovered = await this.reconcile.execute();

        if (recovered.length > 0)
            this.logger.log(`Recovered ${recovered.length} discovery run(s) on startup`);
    }

    async process(job: Job<{ runId?: string }>) {
        if (job.name === RECONCILE_JOB) await this.reconcile.execute();
        else if (job.data.runId) await this.runDiscovery.execute(job.data.runId);
    }
}
