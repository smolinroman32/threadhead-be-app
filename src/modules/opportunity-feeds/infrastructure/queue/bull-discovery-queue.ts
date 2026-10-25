import { Injectable } from '@nestjs/common';
import { QueueFactory } from '../../../../shared/queue/queue.factory.js';
import { DiscoveryQueuePort } from '../../domain/ports/discovery-queue.port.js';

export const DISCOVERY_QUEUE = 'discovery';
export const RUN_JOB = 'run';
export const RECONCILE_JOB = 'reconcile';

const JOB_OPTIONS = { removeOnComplete: true, removeOnFail: true };

@Injectable()
export class BullDiscoveryQueue implements DiscoveryQueuePort {
    readonly queue;

    constructor(factory: QueueFactory) {
        this.queue = factory.createQueue(DISCOVERY_QUEUE);
    }

    async enqueue(runId: string, delayMs = 0) {
        await this.queue.add(RUN_JOB, { runId }, { ...JOB_OPTIONS, delay: Math.max(0, delayMs) });
    }

    async scheduleReconcile(everyMs: number) {
        await this.queue.upsertJobScheduler(
            RECONCILE_JOB,
            { every: everyMs },
            { name: RECONCILE_JOB, opts: JOB_OPTIONS },
        );
    }
}
