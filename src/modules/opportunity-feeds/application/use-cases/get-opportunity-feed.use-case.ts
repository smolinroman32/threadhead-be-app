import { Injectable } from '@nestjs/common';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class GetOpportunityFeedUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    async execute(userId: string, id: string) {
        const feed = await this.repository.findByIdForUser(id, userId);

        if (!feed) throw new OpportunityFeedNotFoundError();

        return feed;
    }
}
