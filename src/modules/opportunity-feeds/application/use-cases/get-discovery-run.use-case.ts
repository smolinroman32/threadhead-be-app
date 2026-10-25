import { Injectable } from '@nestjs/common';
import { DiscoveryRunNotFoundError } from '../../domain/errors/discovery-run-not-found.error.js';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { DiscoveryRunRepositoryPort } from '../../domain/ports/discovery-run-repository.port.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class GetDiscoveryRunUseCase {
    constructor(
        private readonly feeds: OpportunityFeedRepositoryPort,
        private readonly runs: DiscoveryRunRepositoryPort,
    ) {}

    async execute(userId: string, feedId: string, runId: string | 'latest') {
        const feed = await this.feeds.findByIdForUser(feedId, userId);

        if (!feed) throw new OpportunityFeedNotFoundError();

        const run =
            runId === 'latest'
                ? await this.runs.findLatestForFeed(feedId)
                : await this.runs.findByIdForFeed(feedId, runId);

        if (!run) throw new DiscoveryRunNotFoundError();

        return run;
    }
}
