import { Injectable } from '@nestjs/common';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class DeleteOpportunityFeedUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    async execute(userId: string, id: string) {
        const removed = await this.repository.deleteByIdForUser(id, userId);

        if (!removed) throw new OpportunityFeedNotFoundError();
    }
}
