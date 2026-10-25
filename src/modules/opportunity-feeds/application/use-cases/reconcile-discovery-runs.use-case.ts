import { Injectable } from '@nestjs/common';
import { DiscoveryQueuePort } from '../../domain/ports/discovery-queue.port.js';
import { DiscoveryRunRepositoryPort } from '../../domain/ports/discovery-run-repository.port.js';

@Injectable()
export class ReconcileDiscoveryRunsUseCase {
    constructor(
        private readonly runs: DiscoveryRunRepositoryPort,
        private readonly queue: DiscoveryQueuePort,
    ) {}

    async execute() {
        const runIds = await this.runs.reconcile();

        for (const runId of runIds) await this.queue.enqueue(runId);

        return runIds;
    }
}
