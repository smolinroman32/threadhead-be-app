import { Injectable, Logger } from '@nestjs/common';
import type { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';
import { DiscoveryQueuePort } from '../../domain/ports/discovery-queue.port.js';
import { DiscoveryRunRepositoryPort } from '../../domain/ports/discovery-run-repository.port.js';
import { DiscoveryWorkPort } from '../../domain/ports/discovery-work.port.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

const HOUR_MS = 60 * 60_000;

@Injectable()
export class QueueDiscoveryRunUseCase {
    private readonly logger = new Logger(QueueDiscoveryRunUseCase.name);

    constructor(
        private readonly feeds: OpportunityFeedRepositoryPort,
        private readonly runs: DiscoveryRunRepositoryPort,
        private readonly work: DiscoveryWorkPort,
        private readonly queue: DiscoveryQueuePort,
    ) {}

    async execute(feedId: string) {
        const { run, enqueue } = await this.runs.request(feedId);

        if (enqueue) await this.queue.enqueue(run.id);

        return run;
    }

    async afterChange(feedId: string, change: { criteriaChanged: boolean; resumed: boolean }) {
        try {
            const feed = await this.feeds.findById(feedId);

            if (!feed?.isActive || !feed.socialAccountId) return;
            if (change.criteriaChanged || (change.resumed && (await this.hasPendingWork(feed)))) {
                await this.execute(feedId);
            }
        } catch (error) {
            this.logger.warn(`Could not queue a discovery run for feed ${feedId}: ${String(error)}`);
        }
    }

    private async hasPendingWork(feed: OpportunityFeedEntity) {
        const latest = await this.runs.findLatestForFeed(feed.id);

        if (latest?.status === 'QUEUED') return true;

        const since = new Date(Date.now() - feed.freshnessHours * HOUR_MS);

        return (await this.work.staleOpportunities(feed.id, feed.scoringVersion, since)).length > 0;
    }
}
